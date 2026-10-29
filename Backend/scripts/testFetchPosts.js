/**
 * Diagnostic test to confirm fetching posts from Neon Database works perfectly
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function testFetch() {
  try {
    console.log('🔗 Connecting to DB...');
    await pool.query('SELECT 1');
    console.log('✅ Connection established.');

    console.log('📡 Testing getAllPosts SQL query...');
    const result = await pool.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.published_at DESC NULLS LAST, posts.id DESC
      LIMIT 3
    `);

    console.log(`✅ Success! Fetched ${result.rows.length} post(s).`);
    console.log('📋 Sample Post Details:');
    result.rows.forEach(p => {
      console.log(`  - [ID: ${p.id}] "${p.title}" (Status: ${p.status}, Published At: ${p.published_at})`);
    });

  } catch (error) {
    console.error('❌ Database query failed:', error);
  } finally {
    await pool.end();
  }
}

testFetch();
