/**
 * Unit Tests: postController – createPost & updatePost
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.4
 *
 * Key behaviours under test:
 *   - createPost auto-assigns author_id from req.user (Requirement 4.4)
 *   - createPost blocks when req.user is absent (Requirements 4.1, 4.2)
 *   - updatePost preserves publish_date when not in request body (Requirement 3.4)
 *   - updatePost accepts null publish_date for drafts (Requirement 3.3)
 *
 * postController uses pool.connect() for transactions, so we mock the client
 * object returned by pool.connect() rather than pool.query directly.
 */

// ─── Mock dependencies ────────────────────────────────────────────────────────

jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

// uploadMiddleware uses cloudinary — mock it to avoid real uploads
jest.mock('../middleware/uploadMiddleware', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test.jpg' }),
}));

// cloudinary.uploader.destroy is called on image deletion — mock it
jest.mock('cloudinary', () => ({
  v2: {
    uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
    config: jest.fn(),
  },
}));

// generateSlug is a utility — use a simple passthrough mock
jest.mock('../utils/generateSlug', () => jest.fn((s) => s.toLowerCase().replace(/\s+/g, '-')));

const pool = require('../config/db');
const { createPost, updatePost } = require('./postController');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Build a mock transaction client (returned by pool.connect()).
 * Each call to client.query() can be configured via mockResolvedValueOnce.
 */
function buildMockClient() {
  const client = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return client;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── createPost ───────────────────────────────────────────────────────────────
//
// NOTE: getUniquePostSlug uses the module-level `pool.query` (not the
// transaction client), so we mock pool.query for slug checks and
// pool.connect for the transaction client separately.

describe('createPost', () => {
  const baseBody = {
    title: 'Test Post',
    content: 'Some content here',
    status: 'draft',
    publish_date: '',
  };

  const createdRow = {
    id: 42,
    title: 'Test Post',
    slug: 'test-post',
    author_id: 7,
    status: 'draft',
    publish_date: null,
  };

  // ── Authentication guard (Requirements 4.1, 4.2) ─────────────────────────────

  test('returns 401 when req.user is absent (Requirement 4.1)', async () => {
    const client = buildMockClient();
    client.query.mockResolvedValueOnce({}); // BEGIN
    pool.connect.mockResolvedValue(client);

    const req = { body: baseBody, file: null }; // no req.user
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    // ROLLBACK should have been called
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });

  test('returns 401 when req.user.id is falsy (Requirement 4.2)', async () => {
    const client = buildMockClient();
    client.query.mockResolvedValueOnce({}); // BEGIN
    pool.connect.mockResolvedValue(client);

    const req = { body: baseBody, file: null, user: { id: null } };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  // ── Author auto-assignment (Requirement 4.4) ──────────────────────────────────

  test('auto-assigns author_id from req.user.id, not from request body (Requirement 4.4)', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    // pool.query is used by getUniquePostSlug (slug uniqueness check)
    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check → unique

    client.query
      .mockResolvedValueOnce({})                          // BEGIN
      .mockResolvedValueOnce({ rows: [createdRow] })      // INSERT post
      .mockResolvedValueOnce({});                         // COMMIT

    const req = {
      body: { ...baseBody, author_id: 999 }, // attacker tries to set author_id
      file: null,
      user: { id: 7 },
    };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);

    // Find the INSERT call — it should use author_id=7, not 999
    const insertCall = client.query.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('INSERT INTO posts')
    );
    expect(insertCall).toBeDefined();
    // Values: title, slug, seo_title, meta_description, excerpt, content, featured_image,
    //         status, category_id, author_id, published_at, publish_date
    const values = insertCall[1];
    const authorIdIndex = 9;
    expect(values[authorIdIndex]).toBe(7);
    expect(values[authorIdIndex]).not.toBe(999);
  });

  // ── Draft with null publish_date (Requirement 3.3) ───────────────────────────

  test('creates draft post with null publish_date (Requirement 3.3)', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug uniqueness check

    client.query
      .mockResolvedValueOnce({})                          // BEGIN
      .mockResolvedValueOnce({ rows: [createdRow] })      // INSERT
      .mockResolvedValueOnce({});                         // COMMIT

    const req = {
      body: { title: 'Draft', content: 'Content', status: 'draft', publish_date: '' },
      file: null,
      user: { id: 7 },
    };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    const insertCall = client.query.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('INSERT INTO posts')
    );
    const values = insertCall[1];
    // publish_date is the last value (index 11)
    expect(values[11]).toBeNull();
  });

  test('returns 400 when published post has no publish_date', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug uniqueness check

    client.query
      .mockResolvedValueOnce({});  // BEGIN

    const req = {
      body: { title: 'Published', content: 'Content', status: 'published', publish_date: '' },
      file: null,
      user: { id: 7 },
    };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  test('returns 400 when title or content is missing', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    client.query.mockResolvedValueOnce({}); // BEGIN

    const req = {
      body: { title: '', content: '', status: 'draft' },
      file: null,
      user: { id: 7 },
    };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  test('returns 500 on database error during INSERT', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

    client.query
      .mockResolvedValueOnce({})                                    // BEGIN
      .mockRejectedValueOnce(new Error('DB insert failed'));        // INSERT fails

    const req = {
      body: baseBody,
      file: null,
      user: { id: 7 },
    };
    const res = mockRes();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});

// ─── updatePost ───────────────────────────────────────────────────────────────
//
// NOTE: getUniquePostSlug uses module-level pool.query, so we mock pool.query
// for slug checks and pool.connect for the transaction client.

describe('updatePost', () => {
  const existingPost = {
    id: 10,
    title: 'Old Title',
    slug: 'old-title',
    featured_image: null,
    published_at: null,
    publish_date: new Date('2024-06-15T10:00:00Z'),
    status: 'draft',
  };

  const updatedRow = {
    ...existingPost,
    title: 'New Title',
    slug: 'new-title',
    publish_date: new Date('2024-06-15T10:00:00Z'),
  };

  // ── Publish date preservation (Requirement 3.4) ───────────────────────────────

  test('preserves existing publish_date when publish_date key is absent from request body (Requirement 3.4)', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    // pool.query used by getUniquePostSlug
    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check → unique

    client.query
      .mockResolvedValueOnce({})                              // BEGIN
      .mockResolvedValueOnce({ rows: [existingPost] })        // SELECT old post
      .mockResolvedValueOnce({ rows: [updatedRow] })          // UPDATE post
      .mockResolvedValueOnce({});                             // COMMIT

    // publish_date is NOT in the request body
    const req = {
      params: { id: '10' },
      body: { title: 'New Title', content: 'Updated content', status: 'draft' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    // Find the UPDATE call
    const updateCall = client.query.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE posts SET')
    );
    expect(updateCall).toBeDefined();

    // publish_date value in the UPDATE should equal the existing post's publish_date
    const values = updateCall[1];
    // Values: title, slug, seo_title, meta_description, excerpt, content, featured_image,
    //         status, category_id, published_at, publish_date, id
    const publishDateIndex = 10;
    expect(values[publishDateIndex]).toEqual(existingPost.publish_date);
  });

  test('updates publish_date when explicitly provided in request body (Requirement 3.4)', async () => {
    const newDate = '2025-01-20T09:00:00Z';
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [existingPost] })
      .mockResolvedValueOnce({ rows: [{ ...updatedRow, publish_date: new Date(newDate) }] })
      .mockResolvedValueOnce({});

    const req = {
      params: { id: '10' },
      body: { title: 'New Title', content: 'Content', status: 'draft', publish_date: newDate },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const updateCall = client.query.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE posts SET')
    );
    const values = updateCall[1];
    const publishDateIndex = 10;
    // Should be the new date, not the old one
    expect(values[publishDateIndex]).toEqual(new Date(newDate));
    expect(values[publishDateIndex]).not.toEqual(existingPost.publish_date);
  });

  test('sets publish_date to null for drafts when explicitly set to empty (Requirement 3.3)', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [existingPost] })
      .mockResolvedValueOnce({ rows: [{ ...updatedRow, publish_date: null }] })
      .mockResolvedValueOnce({});

    const req = {
      params: { id: '10' },
      body: { title: 'Draft', content: 'Content', status: 'draft', publish_date: '' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const updateCall = client.query.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE posts SET')
    );
    const values = updateCall[1];
    expect(values[10]).toBeNull();
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  test('returns 404 when post does not exist', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce({})                // BEGIN
      .mockResolvedValueOnce({ rows: [] });     // SELECT old post → not found

    const req = {
      params: { id: '999' },
      body: { title: 'Title', content: 'Content', status: 'draft' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test('returns 400 when title or content is missing', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    client.query.mockResolvedValueOnce({}); // BEGIN

    const req = {
      params: { id: '10' },
      body: { title: '', content: '', status: 'draft' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  test('returns 400 when publishing without a publish_date', async () => {
    const postWithoutPublishDate = { ...existingPost, publish_date: null };
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [postWithoutPublishDate] });

    const req = {
      params: { id: '10' },
      body: { title: 'Title', content: 'Content', status: 'published', publish_date: '' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  test('returns 500 on database error during UPDATE', async () => {
    const client = buildMockClient();
    pool.connect.mockResolvedValue(client);

    pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [existingPost] })
      .mockRejectedValueOnce(new Error('DB update failed'));

    const req = {
      params: { id: '10' },
      body: { title: 'Title', content: 'Content', status: 'draft' },
      file: null,
    };
    const res = mockRes();

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});
