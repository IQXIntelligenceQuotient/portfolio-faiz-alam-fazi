require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function addEmailStatusColumn() {
  try {
    console.log('Checking if email_status column exists...');
    
    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_inquiries' 
      AND column_name = 'email_status'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✓ email_status column already exists');
      process.exit(0);
    }

    console.log('Adding email_status column to contact_inquiries table...');
    
    // Add the column
    await pool.query(`
      ALTER TABLE contact_inquiries 
      ADD COLUMN email_status VARCHAR(30) DEFAULT 'pending'
    `);

    console.log('✓ email_status column added successfully');
    
    // Update existing rows to have 'pending' status
    const updateResult = await pool.query(`
      UPDATE contact_inquiries 
      SET email_status = 'pending' 
      WHERE email_status IS NULL
    `);

    console.log(`✓ Updated ${updateResult.rowCount} existing rows`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding email_status column:', error.message);
    process.exit(1);
  }
}

addEmailStatusColumn();
