const pool = require('../config/db');
const { uploadToCloudinary } = require("../middleware/uploadMiddleware");
const cloudinary = require("cloudinary").v2;

// ADDED: Slug generator utility
const generateSlug = require('../utils/generateSlug');

// ADDED: Subscriber notification (fire-and-forget on publish)
const { notifySubscribers } = require('./subscriberController');

// Extract Cloudinary public_id from a secure_url
// e.g. "https://res.cloudinary.com/demo/image/upload/v123/blog-images/abc.jpg"
// → "blog-images/abc"
const getCloudinaryPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Remove version segment (v1234567/) if present
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    // Remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

// Delete image from Cloudinary by its secure_url (fire-and-forget, won't crash on failure)
const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Deleted "${publicId}":`, result.result);
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete "${publicId}":`, err.message);
  }
};



// ADDED: This function makes every post slug unique
const getUniquePostSlug = async (baseSlug, currentPostId = null) => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = `SELECT id FROM posts WHERE slug = $1`;
    const values = [uniqueSlug];

    if (currentPostId) {
      query += ` AND id != $2`;
      values.push(currentPostId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};


// Create Post
const createPost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Require authenticated user — author_id is auto-assigned from req.user
    if (!req.user || !req.user.id) {
      await client.query('ROLLBACK');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Cannot determine post author.'
      });
    }

    let {
      title,
      slug,
      seo_title,
      meta_description,
      excerpt,
      content,
      featured_image_url,
      status,
      category_id,
      publish_date,
      tag_ids,
      faqs,
      article_sections
    } = req.body;

    // Handle uploaded file
    let featured_image = null;

if (req.file) {
  const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
  featured_image = cloudinaryResult.secure_url;
} else if (featured_image_url) {
  featured_image = featured_image_url;
}

    // Parse JSON strings if using FormData
    if (typeof tag_ids === 'string') {
      tag_ids = JSON.parse(tag_ids);
    }
    if (typeof faqs === 'string') {
      faqs = JSON.parse(faqs);
    }
    if (typeof article_sections === 'string') {
      article_sections = JSON.parse(article_sections);
    }

    if (!title || !content) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Auto-assign author_id from the authenticated admin — never from request body
    const finalAuthorId = req.user.id;
    const finalCategoryId = (category_id && category_id !== "") ? Number(category_id) : null;

    const rawSlug = slug && slug.trim() ? slug : title;
    const baseSlug = generateSlug(rawSlug) || `post-${Date.now()}`;
    const finalSlug = await getUniquePostSlug(baseSlug);
    const finalStatus = status === 'published' ? 'published' : 'draft';

    // Validate publish_date: required for published posts, optional (null) for drafts
    const finalPublishDate = (publish_date && publish_date !== "") ? new Date(publish_date) : null;
    if (finalStatus === 'published' && !finalPublishDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'publish_date is required for published posts'
      });
    }

    console.log('Creating post with:', {
      title,
      finalSlug,
      finalStatus,
      finalCategoryId,
      finalAuthorId,
      featured_image,
      finalPublishDate
    });

      // If the post is marked as published we store the date the admin chose (finalPublishDate).
      // If finalPublishDate is null (draft) we store null.
      const publishedAt = finalStatus === 'published' ? finalPublishDate : null;

    const result = await client.query(
      `INSERT INTO posts 
      (title, slug, seo_title, meta_description, excerpt, content, featured_image, status, category_id, author_id, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        title,
        finalSlug,
        seo_title || null,
        meta_description || null,
        excerpt || null,
        content,
        featured_image || null,
        finalStatus,
        finalCategoryId,
        finalAuthorId,
        publishedAt
      ]
    );

    const newPost = result.rows[0];

    // Insert tags
    if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await client.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)`,
          [newPost.id, tagId]
        );
      }
    }

    // Insert FAQs
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i];
        if (faq.question && faq.answer) {
          await client.query(
            `INSERT INTO faqs (post_id, question, answer, sort_order) VALUES ($1, $2, $3, $4)`,
            [newPost.id, faq.question, faq.answer, i]
          );
        }
      }
    }

    // Insert article sections
    if (article_sections && Array.isArray(article_sections) && article_sections.length > 0) {
      for (let i = 0; i < article_sections.length; i++) {
        const section = article_sections[i];
        if (section.heading || section.content) {
          await client.query(
            `INSERT INTO post_article_sections (post_id, heading, content, sort_order) VALUES ($1, $2, $3, $4)`,
            [newPost.id, section.heading || '', section.content || '', i]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Notify subscribers when a post is published (fire-and-forget)
    if (newPost && newPost.status === 'published') {
      notifySubscribers(newPost).catch((e) =>
        console.error('[createPost] notifySubscribers failed:', e.message)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error creating post:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Post slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
      details: error.stack
    });
  } finally {
    client.release();
  }
};


// Get All Posts
const getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.published_at DESC NULLS LAST, posts.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};


// Get Single Post By Slug
const getSinglePost = async (req, res) => {
  try {
    const { slug } = req.params;

    const postResult = await pool.query(
      `SELECT posts.*, categories.name AS category_name
       FROM posts
       LEFT JOIN categories ON posts.category_id = categories.id
       WHERE posts.slug = $1`,
      [slug]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const post = postResult.rows[0];

    const tagsResult = await pool.query(
      `SELECT tags.*
       FROM tags
       INNER JOIN post_tags ON tags.id = post_tags.tag_id
       WHERE post_tags.post_id = $1
       ORDER BY tags.name ASC`,
      [post.id]
    );

    const faqsResult = await pool.query(
      `SELECT *
       FROM faqs
       WHERE post_id = $1
       ORDER BY sort_order ASC`,
      [post.id]
    );

    const articleSectionsResult = await pool.query(
      `SELECT *
       FROM post_article_sections
       WHERE post_id = $1
       ORDER BY sort_order ASC`,
      [post.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...post,
        tags: tagsResult.rows,
        faqs: faqsResult.rows,
        article_sections: articleSectionsResult.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};


// Update Post
const updatePost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    let {
      title,
      slug,
      seo_title,
      meta_description,
      excerpt,
      content,
      featured_image_url,
      status,
      category_id,
      publish_date,
      tag_ids,
      faqs,
      article_sections
    } = req.body;

    // Parse JSON strings if using FormData
    if (typeof tag_ids === 'string') {
      tag_ids = JSON.parse(tag_ids);
    }
    if (typeof faqs === 'string') {
      faqs = JSON.parse(faqs);
    }
    if (typeof article_sections === 'string') {
      article_sections = JSON.parse(article_sections);
    }

    if (!title || !content) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // ADDED: Get old post data to check for old image and published_at
    const oldPostResult = await client.query(
      'SELECT featured_image, published_at FROM posts WHERE id = $1',
      [id]
    );

    if (oldPostResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const oldImage = oldPostResult.rows[0].featured_image;

    // Handle uploaded file
    let featured_image = oldImage; // Keep old image by default
if (req.file) {
  const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
  featured_image = cloudinaryResult.secure_url;
} else if (featured_image_url) {
  featured_image = featured_image_url;
}

    const rawSlug = slug && slug.trim() ? slug : title;
    const baseSlug = generateSlug(rawSlug) || `post-${Date.now()}`;
    const finalSlug = await getUniquePostSlug(baseSlug, id);
    const finalStatus = status === 'published' ? 'published' : 'draft';

    // Get current published_at value
    const currentPost = oldPostResult.rows[0];

    // Preserve publish_date: only update if explicitly provided in request body
    // If publish_date key is present in body, use the new value (even if null for drafts)
    // If publish_date key is absent, keep the existing value
    let finalPublishDate;
    if ('publish_date' in req.body) {
      finalPublishDate = (publish_date && publish_date !== "") ? new Date(publish_date) : null;
    } else {
      finalPublishDate = currentPost.published_at;
    }

    // Determine published_at based on status and publish_date
    const publishedAt = finalStatus === 'published' ? finalPublishDate : null;

    // Validate publish_date: required for published posts, optional (null) for drafts
    if (finalStatus === 'published' && !finalPublishDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'publish_date is required for published posts'
      });
    }

    const result = await client.query(
      `UPDATE posts SET
        title = $1,
        slug = $2,
        seo_title = $3,
        meta_description = $4,
        excerpt = $5,
        content = $6,
        featured_image = $7,
        status = $8,
        category_id = $9,
        published_at = $10
      WHERE id = $11
      RETURNING *`,
      [
        title,
        finalSlug,
        seo_title || null,
        meta_description || null,
        excerpt || null,
        content,
        featured_image || null,
        finalStatus,
        category_id || null,
        publishedAt,
        id
      ]
    );

    // Update tags
    if (tag_ids && Array.isArray(tag_ids)) {
      await client.query(
        `DELETE FROM post_tags WHERE post_id = $1`,
        [id]
      );

      for (const tagId of tag_ids) {
        await client.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)`,
          [id, tagId]
        );
      }
    }

    // Update FAQs
    if (faqs && Array.isArray(faqs)) {
      await client.query(
        `DELETE FROM faqs WHERE post_id = $1`,
        [id]
      );

      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i];
        if (faq.question && faq.answer) {
          await client.query(
            `INSERT INTO faqs (post_id, question, answer, sort_order) VALUES ($1, $2, $3, $4)`,
            [id, faq.question, faq.answer, i]
          );
        }
      }
    }

    // Update article sections
    if (article_sections && Array.isArray(article_sections)) {
      await client.query(
        `DELETE FROM post_article_sections WHERE post_id = $1`,
        [id]
      );

      for (let i = 0; i < article_sections.length; i++) {
        const section = article_sections[i];
        if (section.heading || section.content) {
          await client.query(
            `INSERT INTO post_article_sections (post_id, heading, content, sort_order) VALUES ($1, $2, $3, $4)`,
            [id, section.heading || '', section.content || '', i]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Delete old Cloudinary image if it was replaced with a new upload
    if (req.file && oldImage && oldImage !== featured_image) {
      await deleteCloudinaryImage(oldImage);
    }

    const updatedPost = result.rows[0];

    // Notify subscribers ONLY when transitioning from draft → published (not on every update)
    if (updatedPost && updatedPost.status === 'published' && !currentPost.published_at) {
      notifySubscribers(updatedPost).catch((e) =>
        console.error('[updatePost] notifySubscribers failed:', e.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error updating post:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Post slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message,
      details: error.stack
    });
  } finally {
    client.release();
  }
};


// Delete Post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // ADDED: Get post data first to delete associated image
    const postResult = await pool.query(
      'SELECT featured_image FROM posts WHERE id = $1',
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const featuredImage = postResult.rows[0].featured_image;

    // Delete the post from database
    await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);

    // Delete image from Cloudinary after DB deletion succeeds
    if (featuredImage) {
      await deleteCloudinaryImage(featuredImage);
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};


module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost
};
