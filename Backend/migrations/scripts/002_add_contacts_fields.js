/**
 * Migration 002: Add Contacts Fields
 * 
 * Adds email tracking fields to the contact_inquiries table:
 * - email_status (may already exist from previous script)
 * - email_sent_date
 * - last_error_message
 * 
 * Requirements: 8.2, 2.1, 2.2
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Applying migration: Add contacts fields...');
    
    // 1. Check and add email_status column if it doesn't exist
    const emailStatusCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_inquiries' 
      AND column_name = 'email_status'
    `);

    if (emailStatusCheck.rows.length === 0) {
      console.log('    → Adding email_status column...');
      await pool.query(`
        ALTER TABLE contact_inquiries 
        ADD COLUMN email_status VARCHAR(50) DEFAULT 'not_sent'
      `);
      
      // Update existing rows
      await pool.query(`
        UPDATE contact_inquiries 
        SET email_status = 'not_sent' 
        WHERE email_status IS NULL
      `);
      console.log('    ✓ email_status column added');
    } else {
      console.log('    ⚠️  email_status column already exists, skipping');
    }

    // 2. Check and add email_sent_date column
    const emailSentDateCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_inquiries' 
      AND column_name = 'email_sent_date'
    `);

    if (emailSentDateCheck.rows.length === 0) {
      console.log('    → Adding email_sent_date column...');
      await pool.query(`
        ALTER TABLE contact_inquiries 
        ADD COLUMN email_sent_date TIMESTAMP NULL
      `);
      console.log('    ✓ email_sent_date column added');
    } else {
      console.log('    ⚠️  email_sent_date column already exists, skipping');
    }

    // 3. Check and add last_error_message column
    const lastErrorCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_inquiries' 
      AND column_name = 'last_error_message'
    `);

    if (lastErrorCheck.rows.length === 0) {
      console.log('    → Adding last_error_message column...');
      await pool.query(`
        ALTER TABLE contact_inquiries 
        ADD COLUMN last_error_message TEXT NULL
      `);
      console.log('    ✓ last_error_message column added');
    } else {
      console.log('    ⚠️  last_error_message column already exists, skipping');
    }
    
    console.log('  ✓ Migration applied: Add contacts fields');
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
    console.log('  → Rolling back migration: Add contacts fields...');
    
    // Note: We keep email_status if it existed before this migration
    // Only remove the new columns we added
    
    console.log('    → Removing last_error_message column...');
    await pool.query(`
      ALTER TABLE contact_inquiries 
      DROP COLUMN IF EXISTS last_error_message
    `);
    
    console.log('    → Removing email_sent_date column...');
    await pool.query(`
      ALTER TABLE contact_inquiries 
      DROP COLUMN IF EXISTS email_sent_date
    `);
    
    // Only remove email_status if you're sure it was added by this migration
    // For safety, we'll leave it since it might have been added by addEmailStatusColumn.js
    console.log('    ⚠️  Keeping email_status column (may have existed before migration)');
    
    console.log('  ✓ Migration rolled back: Add contacts fields');
  } catch (error) {
    console.error('  ✗ Rollback failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
