/**
 * Migration: Add communication fields to reviews table
 * 
 * This migration adds fields for tracking review approval status,
 * communication status, and message history.
 * 
 * Requirements: 8.1, 1.1, 1.3
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Applying migration: Add communication fields to reviews table...');
    
    // Add approval_status column
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending'
    `);
    console.log('    ✓ Added approval_status column');
    
    // Add communication_status column
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS communication_status VARCHAR(50) DEFAULT 'email_pending'
    `);
    console.log('    ✓ Added communication_status column');
    
    // Add last_message_type column
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS last_message_type VARCHAR(100)
    `);
    console.log('    ✓ Added last_message_type column');
    
    // Add last_message_date column
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS last_message_date TIMESTAMP
    `);
    console.log('    ✓ Added last_message_date column');
    
    // Update existing records: set approval_status based on is_approved
    await pool.query(`
      UPDATE reviews 
      SET approval_status = CASE 
        WHEN is_approved = TRUE THEN 'approved'
        ELSE 'pending'
      END
      WHERE approval_status = 'pending'
    `);
    console.log('    ✓ Updated existing records with approval_status');
    
    console.log('  ✓ Migration applied successfully');
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
    console.log('  → Rolling back migration: Remove communication fields from reviews table...');
    
    // Remove last_message_date column
    await pool.query(`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS last_message_date
    `);
    console.log('    ✓ Removed last_message_date column');
    
    // Remove last_message_type column
    await pool.query(`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS last_message_type
    `);
    console.log('    ✓ Removed last_message_type column');
    
    // Remove communication_status column
    await pool.query(`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS communication_status
    `);
    console.log('    ✓ Removed communication_status column');
    
    // Remove approval_status column
    await pool.query(`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS approval_status
    `);
    console.log('    ✓ Removed approval_status column');
    
    console.log('  ✓ Migration rolled back successfully');
  } catch (error) {
    console.error('  ✗ Rollback failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
