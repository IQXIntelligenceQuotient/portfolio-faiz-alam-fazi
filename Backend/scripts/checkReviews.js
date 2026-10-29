require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function checkReviews() {
  try {
    console.log('Checking reviews table...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ reviews table does not exist!');
      process.exit(1);
    }

    console.log('✓ reviews table exists\n');

    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position;
    `);

    console.log('Table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Count total records
    const countResult = await pool.query('SELECT COUNT(*) FROM reviews');
    const totalCount = parseInt(countResult.rows[0].count);

    console.log(`\nTotal reviews: ${totalCount}`);

    // Count approved reviews
    const approvedResult = await pool.query('SELECT COUNT(*) FROM reviews WHERE is_approved = TRUE');
    const approvedCount = parseInt(approvedResult.rows[0].count);

    console.log(`Approved reviews: ${approvedCount}`);
    console.log(`Unapproved reviews: ${totalCount - approvedCount}`);

    if (totalCount > 0) {
      // Show all records
      const allResult = await pool.query(`
        SELECT id, name, email, rating, is_approved, created_at
        FROM reviews
        ORDER BY created_at DESC
      `);

      console.log('\nAll reviews:');
      allResult.rows.forEach(row => {
        const status = row.is_approved ? '✓ APPROVED' : '✗ UNAPPROVED';
        console.log(`  [${row.id}] ${row.name} - ${row.rating}★ - ${status}`);
        console.log(`      Email: ${row.email}`);
        console.log(`      Created: ${row.created_at}`);
        console.log('');
      });

      if (approvedCount === 0) {
        console.log('⚠️  WARNING: No approved reviews found!');
        console.log('   Reviews will not appear on public pages until approved.');
        console.log('   To approve reviews:');
        console.log('   1. Go to http://localhost:5176/admin/reviews');
        console.log('   2. Login with admin credentials');
        console.log('   3. Click "Approve" on reviews you want to show publicly');
      }
    } else {
      console.log('\n⚠️  No reviews found in database');
      console.log('   To add test reviews, you can:');
      console.log('   1. Visit the website and submit a review');
      console.log('   2. Or run: node Backend/scripts/seedReviews.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkReviews();
