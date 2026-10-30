/**
 * Migration 004: Add category_id field to tags table
 *
 * Adds a category_id foreign key column to the tags table so that
 * individual tags can be directly associated with a category.
 * This supports grouping tags under category headings in the UI.
 *
 * Requirements: 8.5, 6.1
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Adding category_id column to tags table...');

    // Check if column already exists (idempotent)
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tags'
        AND column_name = 'category_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('  ⚠️  Column category_id already exists on tags, skipping');
      return;
    }

    // Add category_id as a nullable foreign key (nullable so existing tags are not broken)
    await pool.query(`
      ALTER TABLE tags
      ADD COLUMN category_id INTEGER NULL
    `);
    console.log('    ✓ Added category_id column');

    // Add foreign key constraint referencing categories table
    await pool.query(`
      ALTER TABLE tags
      ADD CONSTRAINT fk_tags_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
    `);
    console.log('    ✓ Added foreign key constraint fk_tags_category');

    // Index for fast lookups by category
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tags_category_id
      ON tags(category_id)
    `);
    console.log('    ✓ Created index idx_tags_category_id');

    console.log('  ✓ Migration 004 applied successfully');
  } catch (error) {
    console.error('  ✗ Migration 004 failed:', error.message);
    throw error;
  }
}

/**
 * Rollback the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function down(pool) {
  try {
    console.log('  → Rolling back migration 004: Remove category_id from tags...');

    // Drop index first
    await pool.query(`
      DROP INDEX IF EXISTS idx_tags_category_id
    `);
    console.log('    ✓ Dropped index idx_tags_category_id');

    // Drop foreign key constraint
    await pool.query(`
      ALTER TABLE tags
      DROP CONSTRAINT IF EXISTS fk_tags_category
    `);
    console.log('    ✓ Dropped constraint fk_tags_category');

    // Drop the column
    await pool.query(`
      ALTER TABLE tags
      DROP COLUMN IF EXISTS category_id
    `);
    console.log('    ✓ Dropped column category_id');

    console.log('  ✓ Migration 004 rolled back successfully');
  } catch (error) {
    console.error('  ✗ Rollback 004 failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
