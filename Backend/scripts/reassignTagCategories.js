/**
 * reassignTagCategories.js
 *
 * Fetches all existing tags, matches them by name to the correct category,
 * then PUTs each tag with the correct category_id.
 *
 * Run AFTER deploying the updated tagController.js (which saves category_id).
 *
 * Usage (from Backend/ folder):
 *   node scripts/reassignTagCategories.js
 *
 * To target the live API instead of localhost, set:
 *   API_BASE=https://api.faizalamfaizi.com node scripts/reassignTagCategories.js
 */

require('dotenv').config();

const API_BASE = process.env.API_BASE ||
  process.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'printing.lhr@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Smile@Smile0300';

// ── Tag → Category mapping ────────────────────────────────────────────────────
const TAG_CATEGORY_MAP = {
  // Cyber Law
  'Cybercrime': 'Cyber Law',
  'Cyber Lawyer': 'Cyber Law',
  'Cyber Crime Lawyer': 'Cyber Law',
  'Online Fraud': 'Cyber Law',
  'Internet Crime': 'Cyber Law',
  'Data Theft': 'Cyber Law',
  'Hacking': 'Cyber Law',
  'Cyber Harassment': 'Cyber Law',
  'Online Blackmail': 'Cyber Law',
  'Social Media Crime': 'Cyber Law',
  'Digital Evidence': 'Cyber Law',
  'FIA Cyber Crime': 'Cyber Law',
  'NCCIA Complaint': 'Cyber Law',
  'Fake Profile': 'Cyber Law',
  'Identity Theft': 'Cyber Law',
  'Phishing Scam': 'Cyber Law',

  // Fraud Recovery
  'Scam Recovery': 'Fraud Recovery',
  'Fraud Lawyer': 'Fraud Recovery',
  'Money Recovery': 'Fraud Recovery',
  'Asset Recovery': 'Fraud Recovery',
  'Bank Fraud': 'Fraud Recovery',
  'Investment Scam': 'Fraud Recovery',
  'Crypto Scam': 'Fraud Recovery',
  'Financial Fraud': 'Fraud Recovery',
  'Online Scam': 'Fraud Recovery',
  'Payment Fraud': 'Fraud Recovery',
  'Business Fraud': 'Fraud Recovery',
  'Digital Fraud': 'Fraud Recovery',
  'Fraud Complaint': 'Fraud Recovery',
  'Recovery Lawyer': 'Fraud Recovery',
  'Fraud Case': 'Fraud Recovery',

  // Family Law
  'Family Lawyer': 'Family Law',
  'Divorce Lawyer': 'Family Law',
  'Child Custody': 'Family Law',
  'Child Support': 'Family Law',
  'Khula': 'Family Law',
  'Nikah Registration': 'Family Law',
  'Court Marriage': 'Family Law',
  'Maintenance Case': 'Family Law',
  'Guardian Court': 'Family Law',
  'Family Dispute': 'Family Law',
  'Marriage Dispute': 'Family Law',
  'Domestic Violence': 'Family Law',
  'Wife Rights': 'Family Law',
  'Husband Rights': 'Family Law',
  'Family Mediation': 'Family Law',
  'Divorce Case': 'Family Law',

  // Business Law
  'Business Lawyer': 'Business Law',
  'Corporate Law': 'Business Law',
  'Company Registration': 'Business Law',
  'Startup Lawyer': 'Business Law',
  'Contract Lawyer': 'Business Law',
  'SECP Registration': 'Business Law',
  'FBR Registration': 'Business Law',
  'Business Formation': 'Business Law',
  'Corporate Compliance': 'Business Law',
  'Shareholder Agreement': 'Business Law',
  'Partnership Deed': 'Business Law',
  'Legal Advisory': 'Business Law',
  'Business Dispute': 'Business Law',
  'Tax Compliance': 'Business Law',
  'Company Law': 'Business Law',
  'Corporate Lawyer': 'Business Law',

  // Legal Documents
  'Contract Drafting': 'Legal Documents',
  'Legal Notice': 'Legal Documents',
  'Agreement Drafting': 'Legal Documents',
  'Contract Review': 'Legal Documents',
  'Legal Drafting': 'Legal Documents',
  'Power of Attorney': 'Legal Documents',
  'Affidavit': 'Legal Documents',
  'Undertaking': 'Legal Documents',
  'MoU Drafting': 'Legal Documents',
  'NDA Agreement': 'Legal Documents',
  'Sale Agreement': 'Legal Documents',
  'Rent Agreement': 'Legal Documents',
  'Partnership Agreement': 'Legal Documents',
  'Employment Contract': 'Legal Documents',
  'Service Agreement': 'Legal Documents',
  'Legal Documentation': 'Legal Documents',

  // Immigration Law
  'Immigration Lawyer': 'Immigration Law',
  'Visa Lawyer': 'Immigration Law',
  'Student Visa': 'Immigration Law',
  'Work Visa': 'Immigration Law',
  'Family Visa': 'Immigration Law',
  'Visit Visa': 'Immigration Law',
  'Immigration Appeal': 'Immigration Law',
  'Visa Refusal': 'Immigration Law',
  'Overseas Pakistani': 'Immigration Law',
  'Immigration Documents': 'Immigration Law',
  'Embassy Documents': 'Immigration Law',
  'Travel Ban': 'Immigration Law',
  'Deportation Case': 'Immigration Law',
  'Immigration Advice': 'Immigration Law',
  'Visa Consultation': 'Immigration Law',
  'Immigration Support': 'Immigration Law',

  // Dispute Resolution
  'Dispute Resolution': 'Dispute Resolution',
  'Mediation': 'Dispute Resolution',
  'Arbitration Lawyer': 'Dispute Resolution',
  'Settlement': 'Dispute Resolution',
  'Commercial Dispute': 'Dispute Resolution',
  'Civil Dispute': 'Dispute Resolution',
  'Legal Settlement': 'Dispute Resolution',
  'Negotiation': 'Dispute Resolution',
  'ADR': 'Dispute Resolution',
  'Conflict Resolution': 'Dispute Resolution',
  'Out of Court Settlement': 'Dispute Resolution',
  'Dispute Lawyer': 'Dispute Resolution',
  'Arbitration': 'Dispute Resolution',
  'Mediation Lawyer': 'Dispute Resolution',

  // Property Law
  'Property Lawyer': 'Property Law',
  'Real Estate Lawyer': 'Property Law',
  'Property Dispute': 'Property Law',
  'Land Dispute': 'Property Law',
  'Title Verification': 'Property Law',
  'Property Verification': 'Property Law',
  'Due Diligence': 'Property Law',
  'Property Transfer': 'Property Law',
  'Sale Deed': 'Property Law',
  'Registry': 'Property Law',
  'Mutation': 'Property Law',
  'Possession Dispute': 'Property Law',
  'Inheritance Property': 'Property Law',
  'Tenant Dispute': 'Property Law',
  'Overseas Property': 'Property Law',
  'Property Fraud': 'Property Law',

  // Education Law
  'Education Lawyer': 'Education Law',
  'Student Rights': 'Education Law',
  'School Law': 'Education Law',
  'College Dispute': 'Education Law',
  'University Case': 'Education Law',
  'Student Discipline': 'Education Law',
  'Admission Dispute': 'Education Law',
  'Fee Dispute': 'Education Law',
  'Exam Issue': 'Education Law',
  'Academic Appeal': 'Education Law',
  'Institutional Legal Help': 'Education Law',
  'Education Complaint': 'Education Law',
  'Teacher Rights': 'Education Law',
  'Campus Discipline': 'Education Law',
  'Student Harassment': 'Education Law',
  'Education Policy': 'Education Law',

  // Criminal Law
  'Criminal Lawyer': 'Criminal Law',
  'Criminal Defense': 'Criminal Law',
  'Bail Lawyer': 'Criminal Law',
  'FIR Quashing': 'Criminal Law',
  'Pre Arrest Bail': 'Criminal Law',
  'Post Arrest Bail': 'Criminal Law',
  'Police Case': 'Criminal Law',
  'Criminal Case': 'Criminal Law',
  'Theft Case': 'Criminal Law',
  'Cheque Dishonour': 'Criminal Law',
  'PPC Offence': 'Criminal Law',
  'Criminal Appeal': 'Criminal Law',
  'White Collar Crime': 'Criminal Law',
  'Drug Case': 'Criminal Law',
  'Defence Lawyer': 'Criminal Law',

  // Litigation
  'Litigation Lawyer': 'Litigation',
  'Civil Litigation': 'Litigation',
  'Court Representation': 'Litigation',
  'Civil Lawyer': 'Litigation',
  'Court Case': 'Litigation',
  'Trial Lawyer': 'Litigation',
  'Legal Case': 'Litigation',
  'Civil Suit': 'Litigation',
  'Injunction': 'Litigation',
  'Recovery Suit': 'Litigation',
  'Declaratory Suit': 'Litigation',
  'Court Hearing': 'Litigation',
  'Legal Representation': 'Litigation',
  'Appeal Lawyer': 'Litigation',
  'Case Filing': 'Litigation',
  'Litigation Support': 'Litigation',
};

// Tags that appear in multiple categories — assign to the first listed
// (Online Fraud → Cyber Law, Business Dispute → Business Law, etc.)
const MULTI_CATEGORY_OVERRIDES = {
  'Online Fraud': 'Cyber Law',
  'Business Dispute': 'Business Law',
  'Family Mediation': 'Family Law',
};
Object.assign(TAG_CATEGORY_MAP, MULTI_CATEGORY_OVERRIDES);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return { res, data };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔗 API: ${API_BASE}\n`);

  // 1. Login
  console.log('🔐 Logging in...');
  const { data: loginData } = await fetchJSON(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const token = loginData.token || loginData.data?.token;
  if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
  console.log('✅ Logged in\n');

  // 2. Fetch categories
  console.log('📂 Fetching categories...');
  const { data: catData } = await fetchJSON(`${API_BASE}/api/categories`);
  const categories = catData.categories || catData.data || [];
  if (!categories.length) throw new Error('No categories found.');

  const catMap = {}; // name (lowercase) → id
  for (const c of categories) catMap[c.name.trim().toLowerCase()] = c.id;
  console.log(`✅ ${categories.length} categories loaded\n`);

  // 3. Fetch all tags
  console.log('🏷️  Fetching all tags...');
  const { data: tagData } = await fetchJSON(`${API_BASE}/api/tags`);
  const tags = tagData.data || tagData || [];
  console.log(`✅ ${tags.length} tags found\n`);

  // 4. Reassign each tag
  let updated = 0, skipped = 0, notFound = 0, failed = 0;

  for (const tag of tags) {
    const catName = TAG_CATEGORY_MAP[tag.name];
    if (!catName) {
      console.log(`  ⚪ "${tag.name}" — no mapping, skipping`);
      skipped++;
      continue;
    }

    const categoryId = catMap[catName.toLowerCase()];
    if (!categoryId) {
      console.warn(`  ⚠️  "${tag.name}" → category "${catName}" not found in DB`);
      notFound++;
      continue;
    }

    // Skip if already correctly assigned
    if (tag.category_id === categoryId) {
      console.log(`  ✅ "${tag.name}" already in ${catName}`);
      skipped++;
      continue;
    }

    try {
      const { res, data } = await fetchJSON(`${API_BASE}/api/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tag.name,
          slug: tag.slug,
          category_id: categoryId,
        }),
      });

      if (res.ok && data.success) {
        console.log(`  ✅ "${tag.name}" → ${catName}`);
        updated++;
      } else {
        console.error(`  ❌ "${tag.name}" — ${data.message}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ "${tag.name}" — ${err.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 60));
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Updated  : ${updated}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`❌ Failed   : ${failed}`);
  console.log(`${'─'.repeat(50)}\n`);
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
