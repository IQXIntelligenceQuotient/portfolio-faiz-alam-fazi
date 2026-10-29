require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function checkContacts() {
  try {
    console.log('Checking contact_inquiries table...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contact_inquiries'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ contact_inquiries table does not exist!');
      process.exit(1);
    }

    console.log('✓ contact_inquiries table exists\n');

    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'contact_inquiries'
      ORDER BY ordinal_position;
    `);

    console.log('Table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Count total records
    const countResult = await pool.query('SELECT COUNT(*) FROM contact_inquiries');
    const totalCount = parseInt(countResult.rows[0].count);

    console.log(`\nTotal records: ${totalCount}`);

    if (totalCount > 0) {
      // Show recent records
      const recentResult = await pool.query(`
        SELECT id, name, email, subject, status, email_status, created_at
        FROM contact_inquiries
        ORDER BY created_at DESC
        LIMIT 5
      `);

      console.log('\nRecent inquiries:');
      recentResult.rows.forEach(row => {
        console.log(`  [${row.id}] ${row.name} (${row.email})`);
        console.log(`      Status: ${row.status} | Email: ${row.email_status}`);
        console.log(`      Created: ${row.created_at}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No contact inquiries found in database');
      console.log('   Try submitting a test contact form to create data');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkContacts();
