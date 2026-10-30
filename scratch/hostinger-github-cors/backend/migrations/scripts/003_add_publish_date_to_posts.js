/**
 * Migration: Add publish_date field to posts table
 * 
 * This migration adds a publish_date column to the posts table to support
 * manual scheduling of blog posts for future publication or backdating posts.
 * 
 * Requirements: 8.3, 3.1, 3.3
 * - publish_date is nullable (for draft posts)
 * - Allows manual selection of any date (past or future)
 * - Preserved until manually changed by admin
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Adding publish_date column to posts table...');
    
    // Check if column already exists (idempotent)
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND column_name = 'publish_date'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('  ⚠️  Column publish_date already exists, skipping');
      return;
    }

    // Add the publish_date column (nullable for drafts)
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN publish_date TIMESTAMP NULL
    `);
    
    console.log('  ✓ Column publish_date added successfully');
    
    // Optional: Initialize publish_date for existing published posts
    // Set publish_date to published_at for posts that are already published
    console.log('  → Initializing publish_date for existing published posts...');
    
    const updateResult = await pool.query(`
      UPDATE posts 
      SET publish_date = published_at 
      WHERE status = 'published' 
      AND published_at IS NOT NULL 
      AND publish_date IS NULL
    `);
    
    console.log(`  ✓ Initialized publish_date for ${updateResult.rowCount} published posts`);
    
  } catch (error) {
    console.error('  ✗ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Rollback the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function down(pool) {
  try {
    console.log('  → Removing publish_date column from posts table...');
    
    await pool.query(`
      ALTER TABLE posts 
      DROP COLUMN IF EXISTS publish_date
    `);
    
    console.log('  ✓ Column publish_date removed successfully');
  } catch (error) {
    console.error('  ✗ Rollback failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
