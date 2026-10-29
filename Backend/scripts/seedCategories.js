/**
 * seedCategories.js
 *
 * Logs in as admin, fetches existing categories, and creates any that are missing.
 */
require('dotenv').config();

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'printing.lhr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Smile@Smile0300';

// Categories to ensure exist (keys must match those used in seedTags.js)
const CATEGORIES = [
  'Cyber Law',
  'Fraud Recovery',
  'Business Law',
  'Legal Documents',
  'Immigration Law',
  'Dispute Resolution',
  'Property Law',
  'Education Law',
  'Litigation',
  'Criminal Law',
  'Family Law',
  'Corporate Law' // missing category
];

// Helper to convert a name to a slug (same logic as in the API)
function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const txt = await res.text();
    throw new Error(`Non-JSON (${res.status}): ${txt.slice(0, 200)}`);
  }
  return res.json();
}

(async () => {
  console.log('\n🔗 API:', API_BASE);
  // 1️⃣ Login
  const login = await fetchJSON(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const token = login.token || login.data?.token;
  if (!token) throw new Error('Login failed');
  console.log('✅ Logged in');

  // 2️⃣ Pull existing categories
  const catsRes = await fetchJSON(`${API_BASE}/api/categories`);
  const existing = catsRes.categories || catsRes.data || [];
  const existingMap = {};
  existing.forEach(c => { existingMap[c.name.trim().toLowerCase()] = c.id; });

  // 3️⃣ Create missing ones
  let created = 0, skipped = 0;
  for (const name of CATEGORIES) {
    const key = name.trim().toLowerCase();
    if (existingMap[key]) {
      console.log(`  ⏭️  "${name}" already exists`);
      skipped++;
      continue;
    }
    try {
      const result = await fetchJSON(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, slug: toSlug(name) })
      });
      if (result.success) {
        console.log(`  ✅ Created "${name}"`);
        created++;
      } else {
        console.warn(`  ⚠️  Failed to create "${name}": ${result.message}`);
        skipped++;
      }
    } catch (e) {
      console.error(`  ❌ Error creating "${name}": ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 80));
  }

  console.log('\n' + '-'.repeat(30));
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log('-'.repeat(30) + '\n');
})();
