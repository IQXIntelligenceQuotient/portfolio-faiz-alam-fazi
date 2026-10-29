/**
 * Test server-side OG meta generation directly by simulating the DB queries.
 */
require('dotenv').config({ path: 'Backend/.env' });
const pool = require('../Backend/src/config/db');

const SITE_URL = 'https://faizalamfaizi.com';
const API_URL  = 'https://api.faizalamfaizi.com';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function resolveImageUrl(imagePath) {
  if (!imagePath) return `${SITE_URL}/1-Best-Legal_Consultant-near-me.webp`;
  if (imagePath.startsWith('http')) {
    return encodeURI(decodeURI(imagePath));
  }
  let path = imagePath;
  if (!path.startsWith('/')) path = '/' + path;
  return encodeURI(decodeURI(`${API_URL}${path}`));
}

async function simulateOgRoute() {
  const slug = 'foreign-direct-investment-lawyer-in-pakistan-legal-advisory-for-global-investors';
  console.log('📡 Simulating OG routing for slug:', slug);

  try {
    const result = await pool.query(
      `SELECT p.title, p.slug, p.meta_description, p.excerpt, p.featured_image,
              p.publish_date, p.published_at,
              c.name AS category_name
       FROM posts p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1 AND p.status = 'published'
       LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      console.error('❌ Post not found in DB!');
      return;
    }

    const post = result.rows[0];
    const title       = escapeHtml(post.title);
    const description = escapeHtml(post.meta_description || post.excerpt || 'Read this legal article by Faiz Alam Faizi.');
    const image       = resolveImageUrl(post.featured_image);
    const publishedAt = post.publish_date || post.published_at;
    const modifiedAt  = publishedAt;
    const section     = escapeHtml(post.category_name || 'Legal Services in Pakistan');

    console.log('\n✅ SIMULATED PRE-RENDERED OG META HTML CONTENT:\n');
    console.log(`- Title      : ${title}`);
    console.log(`- Description: ${description}`);
    console.log(`- Image URL  : ${image}`);
    console.log(`- Type       : article`);
    console.log(`- Section    : ${section}`);
    console.log(`- Published  : ${publishedAt}`);

  } catch (error) {
    console.error('❌ Error during simulation:', error.message);
  } finally {
    await pool.end();
  }
}

simulateOgRoute();
