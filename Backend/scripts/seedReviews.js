require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

const sampleReviews = [
  {
    name: "Sarah Ahmed",
    email: "sarah.ahmed@example.com",
    message: "Faiz Alam Faizi provided exceptional legal guidance for our startup. His expertise in tech law and business structuring helped us avoid costly mistakes. Highly professional and responsive.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    message: "Outstanding service! Helped me recover funds from an online fraud case. The legal strategy was clear, effective, and results-driven. I'm grateful for the support.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    message: "Professional, knowledgeable, and trustworthy. Faiz helped with our company registration and compliance matters. Everything was handled smoothly and efficiently.",
    rating: 5,
    is_approved: true
  },
  {
    name: "David Martinez",
    email: "david.martinez@example.com",
    message: "Excellent cross-border legal support. Faiz understood our international business needs and provided practical solutions. Communication was clear throughout the process.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Fatima Ali",
    email: "fatima.ali@example.com",
    message: "Very satisfied with the legal consultancy services. Faiz provided strategic advice that protected our business interests. Would definitely recommend to others.",
    rating: 5,
    is_approved: true
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    message: "Great experience working with Faiz on contract drafting. The agreements were thorough, clear, and protected our company's interests. Professional service from start to finish.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Zainab Hassan",
    email: "zainab.hassan@example.com",
    message: "Faiz helped us with cyber crime litigation. His understanding of both technology and law was impressive. We got the results we needed.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    message: "Highly recommend for startup legal services. Faiz provided investor-ready agreements and compliance frameworks that gave us confidence to scale.",
    rating: 5,
    is_approved: true
  },
  {
    name: "Amina Malik",
    email: "amina.malik@example.com",
    message: "Professional and reliable legal support. Faiz handled our business documentation with precision and attention to detail. Very pleased with the service.",
    rating: 5,
    is_approved: true
  },
  {
    name: "John Anderson",
    email: "john.anderson@example.com",
    message: "Excellent legal strategist. Faiz helped us navigate complex international compliance issues. His practical approach saved us time and money.",
    rating: 5,
    is_approved: true
  }
];

async function seedReviews() {
  try {
    console.log('Seeding reviews...\n');

    let inserted = 0;
    let skipped = 0;

    for (const review of sampleReviews) {
      try {
        const result = await pool.query(
          `INSERT INTO reviews (name, email, message, rating, is_approved)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [review.name, review.email, review.message, review.rating, review.is_approved]
        );

        console.log(`✓ Added: ${review.name} (${review.rating}★) - ID: ${result.rows[0].id}`);
        inserted++;
      } catch (err) {
        console.log(`✗ Skipped: ${review.name} (${err.message})`);
        skipped++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Inserted: ${inserted} reviews`);
    console.log(`   Skipped: ${skipped} reviews`);
    console.log(`\nAll seeded reviews are APPROVED and will appear on public pages.`);
    console.log(`\nNext steps:`);
    console.log(`1. Visit http://localhost:5176/ to see reviews on Home page`);
    console.log(`2. Visit http://localhost:5176/contact to see reviews on Contact page`);
    console.log(`3. Visit http://localhost:5176/admin/reviews to manage reviews`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error.message);
    process.exit(1);
  }
}

seedReviews();
