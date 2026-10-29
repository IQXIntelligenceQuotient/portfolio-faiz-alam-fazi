const pool = require('../config/db');

const createBlogTables = async () => {
  try {
    // ── Step 1: Create base tables ────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        seo_title VARCHAR(255),
        meta_description TEXT,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image TEXT,
        status VARCHAR(30) DEFAULT 'draft',
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS post_article_sections (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        heading VARCHAR(255),
        content TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'new',
        email_status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Step 2: Apply all migrations idempotently ─────────────────────────────
    // Migration 001: reviews communication fields
    await pool.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS communication_status VARCHAR(50) DEFAULT 'email_pending';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS last_message_type VARCHAR(100);
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS last_message_date TIMESTAMP;
    `);

    // Migration 002: contact_inquiries email tracking fields
    await pool.query(`
      ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS email_status VARCHAR(30) DEFAULT 'pending';
      ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS email_sent_date TIMESTAMP NULL;
      ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS last_error_message TEXT NULL;
    `);

    // Migration 003: posts publish_date for manual scheduling / backdating
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP NULL;
    `);
    // Backfill publish_date for existing published posts that don't have it yet
    await pool.query(`
      UPDATE posts
      SET publish_date = published_at
      WHERE status = 'published'
        AND published_at IS NOT NULL
        AND publish_date IS NULL;
    `);

    // Migration 004: tags category_id (direct assignment)
    await pool.query(`
      ALTER TABLE tags ADD COLUMN IF NOT EXISTS category_id INTEGER NULL;
    `);
    // Add FK constraint only if it doesn't exist yet
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'fk_tags_category'
            AND table_name = 'tags'
        ) THEN
          ALTER TABLE tags
            ADD CONSTRAINT fk_tags_category
            FOREIGN KEY (category_id)
            REFERENCES categories(id)
            ON DELETE SET NULL;
        END IF;
      END$$;
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tags_category_id ON tags(category_id);
    `);

    // Migration 005: category_tag_rel many-to-many table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS category_tag_rel (
        category_id INTEGER NOT NULL,
        tag_id      INTEGER NOT NULL,
        priority    INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (category_id, tag_id),
        CONSTRAINT fk_ctr_category
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT fk_ctr_tag
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_ctr_tag_id ON category_tag_rel(tag_id);
      CREATE INDEX IF NOT EXISTS idx_ctr_category_priority ON category_tag_rel(category_id, priority);
    `);

    // subscribers table (created by subscriberController but ensure it exists here too)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(180) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    console.log('Blog tables created successfully');
  } catch (error) {
    console.error('Error creating blog tables:', error.message);
  }
};

module.exports = createBlogTables;
