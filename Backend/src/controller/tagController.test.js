/**
 * Unit Tests: TagController – getTagsByCategory & searchTags
 *
 * Tests for task 3.4: Update TagService with category-based functionality.
 * Requirements: 5.1, 6.6, 8.8
 *
 * These tests mock the database pool so no live DB connection is needed.
 */

// ─── Mock the pool before requiring the controller ──────────────────────────

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../config/db');
const { getTagsByCategory, searchTags } = require('./tagController');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a minimal Express-style mock response object.
 * Captures the status code and JSON body for assertions.
 */
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Build a minimal Express-style mock request object.
 */
function mockReq({ params = {}, query = {} } = {}) {
  return { params, query };
}

// ─── Reset mocks between tests ───────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getTagsByCategory ───────────────────────────────────────────────────────

describe('getTagsByCategory', () => {
  const relTags = [
    { id: 1, name: 'JavaScript', slug: 'javascript', category_id: 10, priority: 0 },
    { id: 2, name: 'TypeScript', slug: 'typescript', category_id: 10, priority: 1 },
  ];
  const directTags = [
    { id: 3, name: 'Node.js', slug: 'nodejs', category_id: 10, priority: null },
  ];

  test('returns 400 when categoryId is missing', async () => {
    const req = mockReq({ params: { categoryId: '' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns 400 when categoryId is not a number', async () => {
    const req = mockReq({ params: { categoryId: 'abc' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns merged tags from both rel table and direct assignment (Requirement 8.8)', async () => {
    // First query: relationship table tags
    pool.query
      .mockResolvedValueOnce({ rows: relTags })
      // Second query: directly-assigned tags
      .mockResolvedValueOnce({ rows: directTags });

    const req = mockReq({ params: { categoryId: '10' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    // All three tags should be present
    expect(body.data).toHaveLength(3);
    expect(body.data.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  test('deduplicates tags that appear in both sources (Requirement 8.8)', async () => {
    // Tag id=1 appears in both rel and direct results
    const relTagsWithOverlap = [
      { id: 1, name: 'JavaScript', slug: 'javascript', category_id: 10, priority: 0 },
    ];
    const directTagsWithOverlap = [
      { id: 1, name: 'JavaScript', slug: 'javascript', category_id: 10, priority: null },
      { id: 2, name: 'TypeScript', slug: 'typescript', category_id: 10, priority: null },
    ];

    pool.query
      .mockResolvedValueOnce({ rows: relTagsWithOverlap })
      .mockResolvedValueOnce({ rows: directTagsWithOverlap });

    const req = mockReq({ params: { categoryId: '10' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    // id=1 should appear only once; id=2 added from direct
    expect(body.data).toHaveLength(2);
    const ids = body.data.map((t) => t.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    // No duplicates
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('rel-table tags come before direct-only tags in the result', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: relTags })
      .mockResolvedValueOnce({ rows: directTags });

    const req = mockReq({ params: { categoryId: '10' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    const body = res.json.mock.calls[0][0];
    // rel tags (id 1, 2) should precede direct-only tag (id 3)
    expect(body.data[0].id).toBe(1);
    expect(body.data[1].id).toBe(2);
    expect(body.data[2].id).toBe(3);
  });

  test('returns empty array when no tags are associated with the category', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ params: { categoryId: '99' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = mockReq({ params: { categoryId: '10' } });
    const res = mockRes();

    await getTagsByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ─── searchTags ──────────────────────────────────────────────────────────────

describe('searchTags', () => {
  const allTags = [
    { id: 5, name: 'React', slug: 'react' },
    { id: 4, name: 'JavaScript', slug: 'javascript' },
    { id: 3, name: 'Node.js', slug: 'nodejs' },
  ];

  test('returns all tags when no query parameter is provided (Requirement 5.1)', async () => {
    pool.query.mockResolvedValueOnce({ rows: allTags });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await searchTags(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(allTags);
  });

  test('returns all tags when query is an empty string (Requirement 5.1)', async () => {
    pool.query.mockResolvedValueOnce({ rows: allTags });

    const req = mockReq({ query: { q: '' } });
    const res = mockRes();

    await searchTags(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(allTags);
  });

  test('returns all tags when query is only whitespace (Requirement 5.1)', async () => {
    pool.query.mockResolvedValueOnce({ rows: allTags });

    const req = mockReq({ query: { q: '   ' } });
    const res = mockRes();

    await searchTags(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(allTags);
  });

  test('filters tags by name using ILIKE when query is provided (Requirement 5.1)', async () => {
    const matchingTags = [{ id: 4, name: 'JavaScript', slug: 'javascript' }];
    pool.query.mockResolvedValueOnce({ rows: matchingTags });

    const req = mockReq({ query: { q: 'java' } });
    const res = mockRes();

    await searchTags(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(matchingTags);

    // Verify the query was called with the correct ILIKE pattern
    const queryCall = pool.query.mock.calls[0];
    expect(queryCall[1]).toEqual(['%java%']);
  });

  test('passes trimmed search term to the database query', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ query: { q: '  react  ' } });
    const res = mockRes();

    await searchTags(req, res);

    const queryCall = pool.query.mock.calls[0];
    // Should trim the query before wrapping in %...%
    expect(queryCall[1]).toEqual(['%react%']);
  });

  test('returns empty array when no tags match the search query', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ query: { q: 'nonexistent' } });
    const res = mockRes();

    await searchTags(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Query failed'));

    const req = mockReq({ query: { q: 'react' } });
    const res = mockRes();

    await searchTags(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
