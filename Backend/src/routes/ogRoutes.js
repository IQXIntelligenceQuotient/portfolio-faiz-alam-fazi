/**
 * ogRoutes.js
 *
 * Serves pre-rendered Open Graph meta tags for social crawlers.
 * When Facebook, WhatsApp, LinkedIn, or Twitter bots request a blog URL,
 * they are redirected here (via .htaccess) and receive a minimal HTML page
 * with the correct og:image, og:title, og:description, etc.
 *
 * Route: GET /og/blogs/:slug
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
    // If it's already a valid absolute URL (like Cloudinary), ensure it's encoded properly
    return encodeURI(decodeURI(imagePath));
  }
  let path = imagePath;
  if (!path.startsWith('/')) path = '/' + path;
  return encodeURI(decodeURI(`${API_URL}${path}`));
}

router.get('/blogs/:slug', async (req, res) => {
  const { slug } = req.params;
  const canonicalUrl = `${SITE_URL}/blogs/${encodeURIComponent(slug)}`;

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
      // Post not found — redirect to the actual page
      return res.redirect(301, canonicalUrl);
    }

    const post = result.rows[0];
    const title       = escapeHtml(post.title);
    const description = escapeHtml(post.meta_description || post.excerpt || 'Read this legal article by Faiz Alam Faizi.');
    const image       = resolveImageUrl(post.featured_image);
    const publishedAt = post.publish_date || post.published_at;
    const modifiedAt  = publishedAt;
    const section     = escapeHtml(post.category_name || 'Legal Services in Pakistan');

    // Fetch tags for article:tag meta
    const tagsResult = await pool.query(
      `SELECT t.name FROM tags t
       INNER JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = (SELECT id FROM posts WHERE slug = $1 LIMIT 1)`,
      [slug]
    );
    const tags = tagsResult.rows.map((r) => r.name);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Faiz Alam Faizi</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Faiz Alam Faizi" />
  <meta property="og:locale" content="en_PK" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  ${publishedAt ? `<meta property="article:published_time" content="${new Date(publishedAt).toISOString()}" />` : ''}
  ${modifiedAt  ? `<meta property="article:modified_time"  content="${new Date(modifiedAt).toISOString()}" />` : ''}
  <meta property="article:author" content="${SITE_URL}/about-faiz-alam-faizi" />
  <meta property="article:section" content="${section}" />
  ${tags.map((t) => `<meta property="article:tag" content="${escapeHtml(t)}" />`).join('\n  ')}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- Redirect real users to the React app immediately -->
  <meta http-equiv="refresh" content="0; url=${canonicalUrl}" />
  <script>window.location.replace("${canonicalUrl}");</script>
</head>
<body>
  <p>Redirecting to <a href="${canonicalUrl}">${title}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache for 1 hour — social platforms cache aggressively
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);

  } catch (error) {
    console.error('[og] Error:', error.message);
    return res.redirect(301, canonicalUrl);
  }
});

module.exports = router;
