require('dotenv').config({ path: 'Backend/.env' });
const pool = require('../Backend/src/config/db');

async function check() {
  const slug = 'foreign-direct-investment-lawyer-in-pakistan-legal-advisory-for-global-investors';
  console.log('Querying slug:', slug);
  const result = await pool.query(
    `SELECT p.title, p.slug, p.status, c.name AS category_name
     FROM posts p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = $1`,
    [slug]
  );
  console.log('Rows found:', result.rows);
  await pool.end();
}
check();
