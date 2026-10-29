/**
 * Migration Tests
 *
 * Tests for all database migration scripts (tasks 2.1 – 2.5).
 * Validates:
 *   - Migration execution (up) adds the expected columns / tables
 *   - Rollback (down) removes those columns / tables
 *   - Existing data is preserved during migrations (Requirements 9.1–9.4)
 *   - Existing data is NOT modified unless explicitly requested (Requirement 9.5)
 *   - Migrations are idempotent (safe to run twice)
 *
 * NOTE: These tests run against a real PostgreSQL database.
 * Set DATABASE_URL (or DB_* vars) in Backend/.env before running.
 *
 * Run:  npm run test:migrations
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns true when the column exists on the given table */
async function columnExists(pool, table, column) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return rows.length > 0;
}

/** Returns true when the table exists in the public schema */
async function tableExists(pool, table) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return rows.length > 0;
}

/** Returns true when the index exists */
async function indexExists(pool, indexName) {
  const { rows } = await pool.query(
    `SELECT 1 FROM pg_indexes WHERE indexname = $1`,
    [indexName]
  );
  return rows.length > 0;
}

/** Returns true when the constraint exists on the given table */
async function constraintExists(pool, table, constraintName) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.table_constraints
     WHERE table_name = $1 AND constraint_name = $2`,
    [table, constraintName]
  );
  return rows.length > 0;
}

// ─── shared pool ────────────────────────────────────────────────────────────

let pool;

beforeAll(() => {
  const useNeon = !!process.env.DATABASE_URL;
  pool = useNeon
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      })
    : new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
      });
});

afterAll(async () => {
  await pool.end();
});

// ─── 001 – reviews fields ───────────────────────────────────────────────────

describe('Migration 001: Add communication fields to reviews table', () => {
  const migration = require('../scripts/001_add_reviews_fields');

  // Ensure a clean starting state for the columns under test
  beforeAll(async () => {
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS approval_status`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS communication_status`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS last_message_type`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS last_message_date`);
  });

  afterAll(async () => {
    // Leave columns in place so subsequent test runs start clean via beforeAll
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS approval_status`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS communication_status`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS last_message_type`);
    await pool.query(`ALTER TABLE reviews DROP COLUMN IF EXISTS last_message_date`);
  });

  test('up() adds all four columns to reviews', async () => {
    await migration.up(pool);

    expect(await columnExists(pool, 'reviews', 'approval_status')).toBe(true);
    expect(await columnExists(pool, 'reviews', 'communication_status')).toBe(true);
    expect(await columnExists(pool, 'reviews', 'last_message_type')).toBe(true);
    expect(await columnExists(pool, 'reviews', 'last_message_date')).toBe(true);
  });

  test('up() is idempotent – running twice does not throw', async () => {
    await expect(migration.up(pool)).resolves.not.toThrow();
  });

  test('existing review rows are preserved after up()', async () => {
    const before = await pool.query('SELECT COUNT(*) FROM reviews');
    await migration.up(pool); // idempotent call
    const after = await pool.query('SELECT COUNT(*) FROM reviews');
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('existing review data is NOT modified (Requirement 9.5)', async () => {
    // Grab a snapshot of all rows before running up() again
    const before = await pool.query(
      'SELECT id, name, email, message, rating, is_approved FROM reviews ORDER BY id'
    );
    await migration.up(pool); // idempotent
    const after = await pool.query(
      'SELECT id, name, email, message, rating, is_approved FROM reviews ORDER BY id'
    );
    expect(after.rows).toEqual(before.rows);
  });

  test('down() removes all four columns', async () => {
    await migration.down(pool);

    expect(await columnExists(pool, 'reviews', 'approval_status')).toBe(false);
    expect(await columnExists(pool, 'reviews', 'communication_status')).toBe(false);
    expect(await columnExists(pool, 'reviews', 'last_message_type')).toBe(false);
    expect(await columnExists(pool, 'reviews', 'last_message_date')).toBe(false);
  });

  test('down() is idempotent – running twice does not throw', async () => {
    await expect(migration.down(pool)).resolves.not.toThrow();
  });
});

// ─── 002 – contacts fields ──────────────────────────────────────────────────

describe('Migration 002: Add email tracking fields to contact_inquiries table', () => {
  const migration = require('../scripts/002_add_contacts_fields');

  beforeAll(async () => {
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS email_sent_date`);
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS last_error_message`);
    // email_status may already exist from an earlier script; drop it too for a clean slate
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS email_status`);
  });

  afterAll(async () => {
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS email_sent_date`);
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS last_error_message`);
    await pool.query(`ALTER TABLE contact_inquiries DROP COLUMN IF EXISTS email_status`);
  });

  test('up() adds email_status, email_sent_date, last_error_message', async () => {
    await migration.up(pool);

    expect(await columnExists(pool, 'contact_inquiries', 'email_status')).toBe(true);
    expect(await columnExists(pool, 'contact_inquiries', 'email_sent_date')).toBe(true);
    expect(await columnExists(pool, 'contact_inquiries', 'last_error_message')).toBe(true);
  });

  test('up() is idempotent', async () => {
    await expect(migration.up(pool)).resolves.not.toThrow();
  });

  test('existing contact rows are preserved after up()', async () => {
    const before = await pool.query('SELECT COUNT(*) FROM contact_inquiries');
    await migration.up(pool);
    const after = await pool.query('SELECT COUNT(*) FROM contact_inquiries');
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('existing contact data is NOT modified (Requirement 9.5)', async () => {
    const before = await pool.query(
      'SELECT id, name, email, subject, message FROM contact_inquiries ORDER BY id'
    );
    await migration.up(pool);
    const after = await pool.query(
      'SELECT id, name, email, subject, message FROM contact_inquiries ORDER BY id'
    );
    expect(after.rows).toEqual(before.rows);
  });

  test('down() removes email_sent_date and last_error_message', async () => {
    await migration.down(pool);

    expect(await columnExists(pool, 'contact_inquiries', 'email_sent_date')).toBe(false);
    expect(await columnExists(pool, 'contact_inquiries', 'last_error_message')).toBe(false);
  });
});

// ─── 003 – publish_date on posts ────────────────────────────────────────────

describe('Migration 003: Add publish_date to posts table', () => {
  const migration = require('../scripts/003_add_publish_date_to_posts');

  beforeAll(async () => {
    await pool.query(`ALTER TABLE posts DROP COLUMN IF EXISTS publish_date`);
  });

  afterAll(async () => {
    await pool.query(`ALTER TABLE posts DROP COLUMN IF EXISTS publish_date`);
  });

  test('up() adds nullable publish_date column', async () => {
    await migration.up(pool);
    expect(await columnExists(pool, 'posts', 'publish_date')).toBe(true);
  });

  test('publish_date column is nullable (accepts NULL for drafts)', async () => {
    const { rows } = await pool.query(
      `SELECT is_nullable
       FROM information_schema.columns
       WHERE table_name = 'posts' AND column_name = 'publish_date'`
    );
    expect(rows[0].is_nullable).toBe('YES');
  });

  test('up() is idempotent', async () => {
    await expect(migration.up(pool)).resolves.not.toThrow();
  });

  test('existing post rows are preserved after up()', async () => {
    const before = await pool.query('SELECT COUNT(*) FROM posts');
    await migration.up(pool);
    const after = await pool.query('SELECT COUNT(*) FROM posts');
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('existing post data is NOT modified (Requirement 9.5)', async () => {
    const before = await pool.query(
      'SELECT id, title, slug, status FROM posts ORDER BY id'
    );
    await migration.up(pool);
    const after = await pool.query(
      'SELECT id, title, slug, status FROM posts ORDER BY id'
    );
    expect(after.rows).toEqual(before.rows);
  });

  test('down() removes publish_date column', async () => {
    await migration.down(pool);
    expect(await columnExists(pool, 'posts', 'publish_date')).toBe(false);
  });

  test('down() is idempotent', async () => {
    await expect(migration.down(pool)).resolves.not.toThrow();
  });
});

// ─── 004 – category_id on tags ──────────────────────────────────────────────

describe('Migration 004: Add category_id to tags table', () => {
  const migration = require('../scripts/004_add_category_id_to_tags');

  beforeAll(async () => {
    await pool.query(`DROP INDEX IF EXISTS idx_tags_category_id`);
    await pool.query(`ALTER TABLE tags DROP CONSTRAINT IF EXISTS fk_tags_category`);
    await pool.query(`ALTER TABLE tags DROP COLUMN IF EXISTS category_id`);
  });

  afterAll(async () => {
    await pool.query(`DROP INDEX IF EXISTS idx_tags_category_id`);
    await pool.query(`ALTER TABLE tags DROP CONSTRAINT IF EXISTS fk_tags_category`);
    await pool.query(`ALTER TABLE tags DROP COLUMN IF EXISTS category_id`);
  });

  test('up() adds category_id column to tags', async () => {
    await migration.up(pool);
    expect(await columnExists(pool, 'tags', 'category_id')).toBe(true);
  });

  test('category_id column is nullable (existing tags are not broken)', async () => {
    const { rows } = await pool.query(
      `SELECT is_nullable
       FROM information_schema.columns
       WHERE table_name = 'tags' AND column_name = 'category_id'`
    );
    expect(rows[0].is_nullable).toBe('YES');
  });

  test('foreign key constraint fk_tags_category is created', async () => {
    expect(await constraintExists(pool, 'tags', 'fk_tags_category')).toBe(true);
  });

  test('index idx_tags_category_id is created', async () => {
    expect(await indexExists(pool, 'idx_tags_category_id')).toBe(true);
  });

  test('up() is idempotent', async () => {
    await expect(migration.up(pool)).resolves.not.toThrow();
  });

  test('existing tag rows are preserved after up()', async () => {
    const before = await pool.query('SELECT COUNT(*) FROM tags');
    await migration.up(pool);
    const after = await pool.query('SELECT COUNT(*) FROM tags');
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('existing tag data is NOT modified (Requirement 9.5)', async () => {
    const before = await pool.query('SELECT id, name, slug FROM tags ORDER BY id');
    await migration.up(pool);
    const after = await pool.query('SELECT id, name, slug FROM tags ORDER BY id');
    expect(after.rows).toEqual(before.rows);
  });

  test('down() removes category_id, constraint, and index', async () => {
    await migration.down(pool);

    expect(await columnExists(pool, 'tags', 'category_id')).toBe(false);
    expect(await constraintExists(pool, 'tags', 'fk_tags_category')).toBe(false);
    expect(await indexExists(pool, 'idx_tags_category_id')).toBe(false);
  });

  test('down() is idempotent', async () => {
    await expect(migration.down(pool)).resolves.not.toThrow();
  });
});

// ─── 005 – category_tag_rel table ───────────────────────────────────────────

describe('Migration 005: Create category_tag_rel table', () => {
  const migration = require('../scripts/005_create_category_tag_rel_table');

  beforeAll(async () => {
    await pool.query(`DROP INDEX IF EXISTS idx_ctr_category_priority`);
    await pool.query(`DROP INDEX IF EXISTS idx_ctr_tag_id`);
    await pool.query(`DROP TABLE IF EXISTS category_tag_rel`);
  });

  afterAll(async () => {
    await pool.query(`DROP INDEX IF EXISTS idx_ctr_category_priority`);
    await pool.query(`DROP INDEX IF EXISTS idx_ctr_tag_id`);
    await pool.query(`DROP TABLE IF EXISTS category_tag_rel`);
  });

  test('up() creates category_tag_rel table', async () => {
    await migration.up(pool);
    expect(await tableExists(pool, 'category_tag_rel')).toBe(true);
  });

  test('table has correct columns: category_id, tag_id, priority, created_at', async () => {
    for (const col of ['category_id', 'tag_id', 'priority', 'created_at']) {
      expect(await columnExists(pool, 'category_tag_rel', col)).toBe(true);
    }
  });

  test('composite primary key (category_id, tag_id) exists', async () => {
    const { rows } = await pool.query(
      `SELECT constraint_name
       FROM information_schema.table_constraints
       WHERE table_name = 'category_tag_rel' AND constraint_type = 'PRIMARY KEY'`
    );
    expect(rows.length).toBe(1);
  });

  test('foreign key to categories exists', async () => {
    expect(await constraintExists(pool, 'category_tag_rel', 'fk_ctr_category')).toBe(true);
  });

  test('foreign key to tags exists', async () => {
    expect(await constraintExists(pool, 'category_tag_rel', 'fk_ctr_tag')).toBe(true);
  });

  test('indexes idx_ctr_tag_id and idx_ctr_category_priority are created', async () => {
    expect(await indexExists(pool, 'idx_ctr_tag_id')).toBe(true);
    expect(await indexExists(pool, 'idx_ctr_category_priority')).toBe(true);
  });

  test('up() is idempotent', async () => {
    await expect(migration.up(pool)).resolves.not.toThrow();
  });

  test('existing categories and tags are preserved after up() (Requirement 9.4)', async () => {
    const catBefore = await pool.query('SELECT COUNT(*) FROM categories');
    const tagBefore = await pool.query('SELECT COUNT(*) FROM tags');

    await migration.up(pool);

    const catAfter = await pool.query('SELECT COUNT(*) FROM categories');
    const tagAfter = await pool.query('SELECT COUNT(*) FROM tags');

    expect(catAfter.rows[0].count).toBe(catBefore.rows[0].count);
    expect(tagAfter.rows[0].count).toBe(tagBefore.rows[0].count);
  });

  test('down() drops table and indexes', async () => {
    await migration.down(pool);

    expect(await tableExists(pool, 'category_tag_rel')).toBe(false);
    expect(await indexExists(pool, 'idx_ctr_tag_id')).toBe(false);
    expect(await indexExists(pool, 'idx_ctr_category_priority')).toBe(false);
  });

  test('down() is idempotent', async () => {
    await expect(migration.down(pool)).resolves.not.toThrow();
  });
});
