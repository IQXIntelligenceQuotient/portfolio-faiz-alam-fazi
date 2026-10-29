/**
 * seedTags.js
 *
 * Seeds all tags into the database, linked to their categories.
 *
 * Usage (from Backend/ folder):
 *   node scripts/seedTags.js
 *
 * Requires: ADMIN_EMAIL and ADMIN_PASSWORD in .env (or set API_BASE below).
 * The script logs in, gets a JWT, fetches categories, then POSTs each tag.
 */

require('dotenv').config();

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'printing.lhr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Smile@Smile0300';

// ── Tag data keyed by category name ──────────────────────────────────────────
const TAG_DATA = {
  'Cyber Law': [
    'Cybercrime', 'Cyber Lawyer', 'Cyber Crime Lawyer', 'Online Fraud',
    'Internet Crime', 'Data Theft', 'Hacking', 'Cyber Harassment',
    'Online Blackmail', 'Social Media Crime', 'Digital Evidence',
    'FIA Cyber Crime', 'NCCIA Complaint', 'Fake Profile',
    'Identity Theft', 'Phishing Scam',
  ],
  'Fraud Recovery': [
    'Scam Recovery', 'Fraud Lawyer', 'Online Fraud', 'Money Recovery',
    'Asset Recovery', 'Bank Fraud', 'Investment Scam', 'Crypto Scam',
    'Financial Fraud', 'Online Scam', 'Payment Fraud', 'Business Fraud',
    'Digital Fraud', 'Fraud Complaint', 'Recovery Lawyer', 'Fraud Case',
  ],
  'Family Law': [
    'Family Lawyer', 'Divorce Lawyer', 'Child Custody', 'Child Support',
    'Khula', 'Nikah Registration', 'Court Marriage', 'Maintenance Case',
    'Guardian Court', 'Family Dispute', 'Marriage Dispute',
    'Domestic Violence', 'Wife Rights', 'Husband Rights',
    'Family Mediation', 'Divorce Case',
  ],
  'Business Law': [
    'Business Lawyer', 'Corporate Law', 'Company Registration',
    'Startup Lawyer', 'Contract Lawyer', 'SECP Registration',
    'FBR Registration', 'Business Formation', 'Corporate Compliance',
    'Shareholder Agreement', 'Partnership Deed', 'Legal Advisory',
    'Business Dispute', 'Tax Compliance', 'Company Law', 'Corporate Lawyer',
    'Company Winding Up', 'Corporate Governance', 'Company Incorporation',
    'Directors Change', 'Board Resolution', 'Form 29', 'Form A',
    'Annual Return', 'SECP Filing', 'Business Legal Advice',
    'Partnership Registration', 'Business NTN Registration',
    'Business Contract', 'SME Legal Services', 'Small Business Lawyer',
    'Business Registration'
  ],
  'Legal Documents': [
    'Contract Drafting', 'Legal Notice', 'Agreement Drafting',
    'Contract Review', 'Legal Drafting', 'Power of Attorney', 'Affidavit',
    'Undertaking', 'MoU Drafting', 'NDA Agreement', 'Sale Agreement',
    'Rent Agreement', 'Partnership Agreement', 'Employment Contract',
    'Service Agreement', 'Legal Documentation',
  ],
  'Immigration Law': [
    'Immigration Lawyer', 'Visa Lawyer', 'Student Visa', 'Work Visa',
    'Family Visa', 'Visit Visa', 'Immigration Appeal', 'Visa Refusal',
    'Overseas Pakistani', 'Immigration Documents', 'Embassy Documents',
    'Travel Ban', 'Deportation Case', 'Immigration Advice',
    'Visa Consultation', 'Immigration Support',
  ],
  'Dispute Resolution': [
    'Dispute Resolution', 'Mediation', 'Arbitration Lawyer', 'Settlement',
    'Commercial Dispute', 'Family Mediation', 'Business Dispute',
    'Civil Dispute', 'Legal Settlement', 'Negotiation', 'ADR',
    'Conflict Resolution', 'Out of Court Settlement', 'Dispute Lawyer',
    'Arbitration', 'Mediation Lawyer',
  ],
  'Property Law': [
    'Property Lawyer', 'Real Estate Lawyer', 'Property Dispute',
    'Land Dispute', 'Title Verification', 'Property Verification',
    'Due Diligence', 'Property Transfer', 'Sale Deed', 'Registry',
    'Mutation', 'Possession Dispute', 'Inheritance Property',
    'Tenant Dispute', 'Overseas Property', 'Property Fraud',
  ],
  'Education Law': [
    'Education Lawyer', 'Student Rights', 'School Law', 'College Dispute',
    'University Case', 'Student Discipline', 'Admission Dispute',
    'Fee Dispute', 'Exam Issue', 'Academic Appeal',
    'Institutional Legal Help', 'Education Complaint', 'Teacher Rights',
    'Campus Discipline', 'Student Harassment', 'Education Policy',
  ],
  'Criminal Law': [
    'Criminal Lawyer', 'Criminal Defense', 'Bail Lawyer', 'FIR Quashing',
    'Pre Arrest Bail', 'Post Arrest Bail', 'Police Case', 'Criminal Case',
    'Theft Case', 'Cheque Dishonour', 'Fraud Case', 'PPC Offence',
    'Criminal Appeal', 'White Collar Crime', 'Drug Case', 'Defence Lawyer',
  ],
  'Litigation': [
    'Litigation Lawyer', 'Civil Litigation', 'Court Representation',
    'Civil Lawyer', 'Court Case', 'Trial Lawyer', 'Legal Case',
    'Civil Suit', 'Injunction', 'Recovery Suit', 'Declaratory Suit',
    'Court Hearing', 'Legal Representation', 'Appeal Lawyer',
    'Case Filing', 'Litigation Support',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔗 API: ${API_BASE}\n`);

  // 1. Login
  console.log('🔐 Logging in...');
  const loginData = await fetchJSON(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const token = loginData.token || loginData.data?.token;
  if (!token) throw new Error('Login failed — no token in response: ' + JSON.stringify(loginData));
  console.log('✅ Logged in\n');

  // 2. Fetch categories
  console.log('📂 Fetching categories...');
  const catData = await fetchJSON(`${API_BASE}/api/categories`);
  const categories = catData.categories || catData.data || [];
  if (categories.length === 0) throw new Error('No categories found. Create them first.');

  // Build name → id map (case-insensitive)
  const catMap = {};
  for (const c of categories) {
    catMap[c.name.trim().toLowerCase()] = c.id;
  }
  console.log(`✅ Found ${categories.length} categories\n`);

  // 3. Create tags
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const [catName, tagNames] of Object.entries(TAG_DATA)) {
    const categoryId = catMap[catName.trim().toLowerCase()];
    if (!categoryId) {
      console.warn(`⚠️  Category not found: "${catName}" — skipping ${tagNames.length} tags`);
      skipped += tagNames.length;
      continue;
    }

    console.log(`\n📌 ${catName} (id: ${categoryId}) — ${tagNames.length} tags`);

    for (const tagName of tagNames) {
      const slug = toSlug(tagName);
      try {
        const result = await fetchJSON(`${API_BASE}/api/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: tagName, slug, category_id: categoryId }),
        });

        if (result.success) {
          console.log(`  ✅ "${tagName}"`);
          created++;
        } else {
          console.log(`  ⚠️  "${tagName}" — ${result.message}`);
          skipped++;
        }
      } catch (err) {
        // 409 = slug already exists — treat as skip not failure
        if (err.message && err.message.includes('409')) {
          console.log(`  ⏭️  "${tagName}" — already exists`);
          skipped++;
        } else {
          console.error(`  ❌ "${tagName}" — ${err.message}`);
          failed++;
        }
      }

      // Small delay to avoid overwhelming the server
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Created : ${created}`);
  console.log(`⏭️  Skipped : ${skipped}`);
  console.log(`❌ Failed  : ${failed}`);
  console.log(`${'─'.repeat(50)}\n`);
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
