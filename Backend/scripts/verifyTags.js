/**
 * Quick verification script: checks tags-per-category directly from the DB.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

async function main() {
  await pool.query('SELECT 1');
  console.log('\n🔍 Verification Report\n');

  // 1. Total tags
  const total = await pool.query('SELECT COUNT(*) FROM tags');
  console.log(`Total tags: ${total.rows[0].count}`);

  // 2. Tags with category_id
  const linked = await pool.query('SELECT COUNT(*) FROM tags WHERE category_id IS NOT NULL');
  console.log(`Tags with category_id: ${linked.rows[0].count}`);

  // 3. Tags WITHOUT category_id (should be 0)
  const unlinked = await pool.query('SELECT COUNT(*) FROM tags WHERE category_id IS NULL');
  console.log(`Tags without category_id (Uncategorized): ${unlinked.rows[0].count}`);

  // 4. category_tag_rel rows
  const relCount = await pool.query('SELECT COUNT(*) FROM category_tag_rel');
  console.log(`category_tag_rel rows: ${relCount.rows[0].count}`);

  // 5. Per-category breakdown (via category_tag_rel — this is what the API uses)
  console.log('\n📊 Tags per category (via category_tag_rel):');
  const perCatRel = await pool.query(`
    SELECT c.id, c.name, COUNT(ctr.tag_id) AS tag_count
    FROM categories c
    LEFT JOIN category_tag_rel ctr ON ctr.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name
  `);
  for (const row of perCatRel.rows) {
    console.log(`  [${row.id}] ${row.name}: ${row.tag_count} tags`);
  }

  // 6. Per-category breakdown (via tags.category_id)
  console.log('\n📊 Tags per category (via tags.category_id):');
  const perCatDirect = await pool.query(`
    SELECT c.id, c.name, COUNT(t.id) AS tag_count
    FROM categories c
    LEFT JOIN tags t ON t.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name
  `);
  for (const row of perCatDirect.rows) {
    console.log(`  [${row.id}] ${row.name}: ${row.tag_count} tags`);
  }

  // 7. Sample: first 5 uncategorized tags (if any)
  const uncatTags = await pool.query(`
    SELECT id, name, slug, category_id FROM tags WHERE category_id IS NULL LIMIT 5
  `);
  if (uncatTags.rows.length > 0) {
    console.log('\n⚠️  Sample uncategorized tags:');
    uncatTags.rows.forEach(t => console.log(`  id=${t.id} name="${t.name}" slug="${t.slug}"`));
  } else {
    console.log('\n✅ No uncategorized tags found!');
  }

  console.log('\n✅ Verification complete\n');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Error:', err.message);
  try { await pool.end(); } catch {}
  process.exit(1);
});
