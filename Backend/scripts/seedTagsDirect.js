/**
 * seedTagsDirect.js
 *
 * Seeds tags directly into the database (no API server required).
 * Connects to Neon PostgreSQL via DATABASE_URL from .env.
 *
 * What it does:
 *   1. Ensures all categories exist (creates missing ones)
 *   2. Ensures all tags exist (creates missing ones)
 *   3. Updates tags.category_id for every tag
 *   4. Populates category_tag_rel for every tag
 *
 * Usage:
 *   node Backend/scripts/seedTagsDirect.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

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
  'Corporate Law': [
    'Corporate Law', 'Corporate Lawyer', 'Corporate Governance',
    'Corporate Compliance', 'Company Law', 'Company Registration',
    'Company Incorporation', 'Company Winding Up', 'Directors Change',
    'Board Resolution', 'SECP Registration', 'SECP Filing',
    'Annual Return', 'Form 29', 'Form A', 'Shareholder Agreement',
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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Direct Tag Seeder — connecting to database...\n');

  // Wait for pool to be ready
  await pool.query('SELECT 1');

  // ── Step 1: Ensure categories exist ─────────────────────────────────────
  console.log('📂 Step 1: Ensuring categories exist...');
  const categoryNames = Object.keys(TAG_DATA);
  const catMap = {}; // name (lowercase) → id

  for (const catName of categoryNames) {
    const key = catName.trim().toLowerCase();

    // Check if category exists
    const existing = await pool.query(
      `SELECT id FROM categories WHERE LOWER(name) = $1`,
      [key]
    );

    if (existing.rows.length > 0) {
      catMap[key] = existing.rows[0].id;
      console.log(`  ⏭️  "${catName}" already exists (id: ${catMap[key]})`);
    } else {
      // Create it
      const slug = toSlug(catName);
      const inserted = await pool.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`,
        [catName, slug]
      );
      catMap[key] = inserted.rows[0].id;
      console.log(`  ✅ Created "${catName}" (id: ${catMap[key]})`);
    }
  }

  console.log(`\n✅ ${Object.keys(catMap).length} categories ready\n`);

  // ── Step 2: Ensure tags exist & update category_id ──────────────────────
  console.log('🏷️  Step 2: Seeding tags and linking to categories...\n');

  let created = 0, updated = 0, skipped = 0, relCreated = 0;
  const processedSlugs = new Set(); // handle duplicate tag names across categories

  for (const [catName, tagNames] of Object.entries(TAG_DATA)) {
    const categoryId = catMap[catName.trim().toLowerCase()];
    if (!categoryId) {
      console.warn(`  ⚠️  Category not found: "${catName}" — skipping`);
      continue;
    }

    console.log(`\n📌 ${catName} (id: ${categoryId}) — ${tagNames.length} tags`);

    for (const tagName of tagNames) {
      const slug = toSlug(tagName);

      // Skip if we already processed this slug in another category
      // (some tags appear in multiple categories — first category wins for category_id)
      const isFirstOccurrence = !processedSlugs.has(slug);
      processedSlugs.add(slug);

      // Check if tag exists
      const existing = await pool.query(
        `SELECT id, category_id FROM tags WHERE slug = $1`,
        [slug]
      );

      let tagId;

      if (existing.rows.length > 0) {
        tagId = existing.rows[0].id;
        const currentCatId = existing.rows[0].category_id;

        // Update category_id if it's null or wrong (only on first occurrence)
        if (isFirstOccurrence && currentCatId !== categoryId) {
          await pool.query(
            `UPDATE tags SET category_id = $1 WHERE id = $2`,
            [categoryId, tagId]
          );
          console.log(`  🔄 "${tagName}" — updated category_id → ${categoryId}`);
          updated++;
        } else {
          console.log(`  ⏭️  "${tagName}" — already correct`);
          skipped++;
        }
      } else {
        // Create new tag
        const inserted = await pool.query(
          `INSERT INTO tags (name, slug, category_id) VALUES ($1, $2, $3) RETURNING id`,
          [tagName, slug, categoryId]
        );
        tagId = inserted.rows[0].id;
        console.log(`  ✅ "${tagName}" — created (id: ${tagId})`);
        created++;
      }

      // ── Step 3: Ensure category_tag_rel row ───────────────────────────
      try {
        const relResult = await pool.query(
          `INSERT INTO category_tag_rel (category_id, tag_id, priority)
           VALUES ($1, $2, 0)
           ON CONFLICT (category_id, tag_id) DO NOTHING
           RETURNING *`,
          [categoryId, tagId]
        );
        if (relResult.rows.length > 0) {
          relCreated++;
        }
      } catch (err) {
        console.warn(`  ⚠️  category_tag_rel error for "${tagName}": ${err.message}`);
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Tags created   : ${created}`);
  console.log(`🔄 Tags updated   : ${updated}`);
  console.log(`⏭️  Tags skipped   : ${skipped}`);
  console.log(`🔗 Relations added: ${relCreated}`);
  console.log(`${'─'.repeat(50)}`);

  // ── Verification ────────────────────────────────────────────────────────
  console.log('\n🔍 Verification:');

  const totalTags = await pool.query(`SELECT COUNT(*) FROM tags`);
  console.log(`  Total tags in DB: ${totalTags.rows[0].count}`);

  const linkedTags = await pool.query(`SELECT COUNT(*) FROM tags WHERE category_id IS NOT NULL`);
  console.log(`  Tags with category_id: ${linkedTags.rows[0].count}`);

  const unlinkedTags = await pool.query(`SELECT COUNT(*) FROM tags WHERE category_id IS NULL`);
  console.log(`  Tags without category_id: ${unlinkedTags.rows[0].count}`);

  const relCount = await pool.query(`SELECT COUNT(*) FROM category_tag_rel`);
  console.log(`  category_tag_rel rows: ${relCount.rows[0].count}`);

  // Show sample per category
  console.log('\n📊 Tags per category:');
  const perCat = await pool.query(`
    SELECT c.name, COUNT(t.id) AS tag_count
    FROM categories c
    LEFT JOIN tags t ON t.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name
  `);
  for (const row of perCat.rows) {
    console.log(`  ${row.name}: ${row.tag_count} tags`);
  }

  console.log('\n✅ Done!\n');
  await pool.end();
}

main().catch(async (err) => {
  console.error('\n💥 Fatal error:', err.message);
  console.error(err.stack);
  try { await pool.end(); } catch {}
  process.exit(1);
});
