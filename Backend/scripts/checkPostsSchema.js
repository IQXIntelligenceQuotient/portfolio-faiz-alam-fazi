/**
 * Quick check: which columns exist on the posts table?
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function main() {
  await pool.query('SELECT 1');
  
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'posts'
    ORDER BY ordinal_position
  `);
  
  console.log('\n📋 Posts table columns:\n');
  for (const row of result.rows) {
    console.log(`  ${row.column_name.padEnd(25)} ${row.data_type.padEnd(30)} nullable=${row.is_nullable}`);
  }
  
  // Also check if created_at and updated_at exist
  const hasCreatedAt = result.rows.some(r => r.column_name === 'created_at');
  const hasUpdatedAt = result.rows.some(r => r.column_name === 'updated_at');
  const hasPublishedAt = result.rows.some(r => r.column_name === 'published_at');
  const hasPublishDate = result.rows.some(r => r.column_name === 'publish_date');
  
  console.log('\n📊 Key columns:');
  console.log(`  created_at:   ${hasCreatedAt ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  updated_at:   ${hasUpdatedAt ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  published_at: ${hasPublishedAt ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  publish_date: ${hasPublishDate ? '✅ EXISTS' : '❌ MISSING'}`);
  
  console.log('');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Error:', err.message);
  try { await pool.end(); } catch {}
  process.exit(1);
});
