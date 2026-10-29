/**
 * Property-Based Test: Publish Date Preservation
 *
 * Feature: admin-panel-improvements, Property 5: Publish Date Preservation
 * Validates: Requirements 3.4
 *
 * Property: For any valid ISO datetime string stored as a post's publish_date,
 * when updatePost is called WITHOUT including publish_date in the request body,
 * the controller must pass through the existing publish_date from the DB —
 * it must NOT overwrite it with null or any other value.
 */

// ─── Mock dependencies ────────────────────────────────────────────────────────

jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

jest.mock('../middleware/uploadMiddleware', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test.jpg' }),
}));

jest.mock('cloudinary', () => ({
  v2: {
    uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
    config: jest.fn(),
  },
}));

jest.mock('../utils/generateSlug', () => jest.fn((s) => s.toLowerCase().replace(/\s+/g, '-')));

const fc = require('fast-check');
const pool = require('../config/db');
const { updatePost } = require('./postController');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function buildMockClient() {
  return {
    query: jest.fn(),
    release: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Arbitraries ──────────────────────────────────────────────────────────────

/**
 * Generates valid ISO 8601 datetime strings covering past and future dates.
 * Constrained to years 2000–2099 to stay within realistic post scheduling range.
 */
const isoDateArb = fc
  .date({
    min: new Date('2000-01-01T00:00:00.000Z'),
    max: new Date('2099-12-31T23:59:59.999Z'),
  })
  .map((d) => d.toISOString());

/**
 * Generates a non-empty title string (printable ASCII, no control chars).
 */
const titleArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/**
 * Generates a non-empty content string.
 */
const contentArb = fc.string({ minLength: 1, maxLength: 200 });

// ─── Property Test ────────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 3.4**
 *
 * Property 5: Publish Date Preservation
 *
 * For any valid ISO datetime string as publish_date stored in the DB,
 * when updatePost is called WITHOUT publish_date in the request body,
 * the value passed to the UPDATE SQL query must equal the existing DB value.
 */
describe('Property 5: Publish Date Preservation (Feature: admin-panel-improvements)', () => {
  test(
    'updatePost preserves existing publish_date when publish_date is absent from request body — for any valid ISO date',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          isoDateArb,
          titleArb,
          contentArb,
          async (existingIsoDate, title, content) => {
            jest.clearAllMocks();

            const existingPublishDate = new Date(existingIsoDate);

            // The existing post row returned by the SELECT inside updatePost
            const existingPost = {
              id: 10,
              title: 'Old Title',
              slug: 'old-title',
              featured_image: null,
              published_at: null,
              publish_date: existingPublishDate,
              status: 'draft',
            };

            const updatedRow = {
              ...existingPost,
              title,
              slug: title.toLowerCase().replace(/\s+/g, '-'),
              publish_date: existingPublishDate,
            };

            const client = buildMockClient();
            pool.connect.mockResolvedValue(client);

            // pool.query is used by getUniquePostSlug (slug uniqueness check)
            pool.query.mockResolvedValueOnce({ rows: [] }); // slug check → unique

            client.query
              .mockResolvedValueOnce({})                            // BEGIN
              .mockResolvedValueOnce({ rows: [existingPost] })      // SELECT old post
              .mockResolvedValueOnce({ rows: [updatedRow] })        // UPDATE post
              .mockResolvedValueOnce({});                           // COMMIT

            // Request body does NOT include publish_date key
            const req = {
              params: { id: '10' },
              body: { title, content, status: 'draft' },
              file: null,
            };
            const res = mockRes();

            await updatePost(req, res);

            // Controller must respond 200
            expect(res.status).toHaveBeenCalledWith(200);

            // Find the UPDATE posts SET call
            const updateCall = client.query.mock.calls.find(
              (call) =>
                typeof call[0] === 'string' &&
                call[0].includes('UPDATE posts SET')
            );

            expect(updateCall).toBeDefined();

            // publish_date is at parameter index 10 (0-based) in the UPDATE query:
            // $1=title, $2=slug, $3=seo_title, $4=meta_description, $5=excerpt,
            // $6=content, $7=featured_image, $8=status, $9=category_id,
            // $10=published_at, $11=publish_date ($11 → index 10), $12=id
            const publishDateValue = updateCall[1][10];

            // The value passed to the DB must equal the original publish_date
            expect(publishDateValue).toEqual(existingPublishDate);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    },
    60000 // 60s timeout for 100 iterations
  );

  test(
    'updatePost does NOT set publish_date to null when publish_date is absent from request body — for any valid ISO date',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          isoDateArb,
          titleArb,
          contentArb,
          async (existingIsoDate, title, content) => {
            jest.clearAllMocks();

            const existingPublishDate = new Date(existingIsoDate);

            const existingPost = {
              id: 42,
              title: 'Some Post',
              slug: 'some-post',
              featured_image: null,
              published_at: null,
              publish_date: existingPublishDate,
              status: 'draft',
            };

            const client = buildMockClient();
            pool.connect.mockResolvedValue(client);

            pool.query.mockResolvedValueOnce({ rows: [] }); // slug check

            client.query
              .mockResolvedValueOnce({})
              .mockResolvedValueOnce({ rows: [existingPost] })
              .mockResolvedValueOnce({ rows: [existingPost] })
              .mockResolvedValueOnce({});

            const req = {
              params: { id: '42' },
              body: { title, content, status: 'draft' },
              file: null,
            };
            const res = mockRes();

            await updatePost(req, res);

            const updateCall = client.query.mock.calls.find(
              (call) =>
                typeof call[0] === 'string' &&
                call[0].includes('UPDATE posts SET')
            );

            expect(updateCall).toBeDefined();

            const publishDateValue = updateCall[1][10];

            // Must NOT be null — the original date must be preserved
            expect(publishDateValue).not.toBeNull();
            expect(publishDateValue).toEqual(existingPublishDate);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    },
    60000
  );
});
