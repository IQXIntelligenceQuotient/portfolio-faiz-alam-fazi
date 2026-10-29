/**
 * Migration 005: Create category_tag_rel table
 *
 * Creates a many-to-many relationship table between categories and tags
 * with a priority field for custom ordering. This enables the UI to
 * prioritize/highlight tags that belong to the currently selected category.
 *
 * Requirements: 8.5, 6.3
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Creating category_tag_rel table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS category_tag_rel (
        category_id INTEGER NOT NULL,
        tag_id      INTEGER NOT NULL,
        priority    INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (category_id, tag_id),
        CONSTRAINT fk_ctr_category
          FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_ctr_tag
          FOREIGN KEY (tag_id)
          REFERENCES tags(id)
          ON DELETE CASCADE
      )
    `);
    console.log('    ✓ Table category_tag_rel created');

    // Index for reverse lookups (find all categories a tag belongs to)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ctr_tag_id
      ON category_tag_rel(tag_id)
    `);
    console.log('    ✓ Created index idx_ctr_tag_id');

    // Index for priority-ordered tag listing per category
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ctr_category_priority
      ON category_tag_rel(category_id, priority)
    `);
    console.log('    ✓ Created index idx_ctr_category_priority');

    console.log('  ✓ Migration 005 applied successfully');
  } catch (error) {
    console.error('  ✗ Migration 005 failed:', error.message);
    throw error;
  }
}

/**
 * Rollback the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function down(pool) {
  try {
    console.log('  → Dropping category_tag_rel table...');

    await pool.query(`DROP INDEX IF EXISTS idx_ctr_category_priority`);
    console.log('    ✓ Dropped index idx_ctr_category_priority');

    await pool.query(`DROP INDEX IF EXISTS idx_ctr_tag_id`);
    console.log('    ✓ Dropped index idx_ctr_tag_id');

    await pool.query(`DROP TABLE IF EXISTS category_tag_rel`);
    console.log('    ✓ Dropped table category_tag_rel');

    console.log('  ✓ Migration 005 rolled back successfully');
  } catch (error) {
    console.error('  ✗ Rollback 005 failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
