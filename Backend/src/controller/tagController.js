const pool = require('../config/db');
const generateSlug = require('../utils/generateSlug');

const getUniqueTagSlug = async (baseSlug, currentTagId = null) => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = `SELECT id FROM tags WHERE slug = $1`;
    const values = [uniqueSlug];

    if (currentTagId) {
      query += ` AND id != $2`;
      values.push(currentTagId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};

const createTag = async (req, res) => {
  try {
    const { name, slug, category_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    const rawSlug = slug && slug.trim() ? slug : name;
    const baseSlug = generateSlug(rawSlug) || `tag-${Date.now()}`;
    const finalSlug = await getUniqueTagSlug(baseSlug);

    const catId = category_id ? Number(category_id) : null;

    // Insert tag — include category_id if the column exists (added by migration 004)
    let result;
    try {
      result = await pool.query(
        `INSERT INTO tags (name, slug, category_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, finalSlug, catId]
      );
    } catch (colErr) {
      // Fallback: column may not exist yet on older DB instances
      if (colErr.code === '42703') {
        result = await pool.query(
          `INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *`,
          [name, finalSlug]
        );
      } else {
        throw colErr;
      }
    }

    const tag = result.rows[0];

    // Also insert into category_tag_rel (many-to-many, migration 005)
    if (catId) {
      try {
        await pool.query(
          `INSERT INTO category_tag_rel (category_id, tag_id, priority)
           VALUES ($1, $2, 0)
           ON CONFLICT (category_id, tag_id) DO NOTHING`,
          [catId, tag.id]
        );
      } catch {
        // Table may not exist yet — non-fatal
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Tag slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

const getTags = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tags ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, category_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    const rawSlug = slug && slug.trim() ? slug : name;
    const baseSlug = generateSlug(rawSlug) || `tag-${Date.now()}`;
    const finalSlug = await getUniqueTagSlug(baseSlug, id);

    const catId = category_id ? Number(category_id) : null;

    // Update tag — include category_id if the column exists
    let result;
    try {
      result = await pool.query(
        `UPDATE tags SET
          name = $1,
          slug = $2,
          category_id = $3
         WHERE id = $4
         RETURNING *`,
        [name, finalSlug, catId, id]
      );
    } catch (colErr) {
      if (colErr.code === '42703') {
        result = await pool.query(
          `UPDATE tags SET name = $1, slug = $2 WHERE id = $3 RETURNING *`,
          [name, finalSlug, id]
        );
      } else {
        throw colErr;
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const tag = result.rows[0];

    // Sync category_tag_rel: remove old entries for this tag, add new one if catId set
    try {
      await pool.query(`DELETE FROM category_tag_rel WHERE tag_id = $1`, [id]);
      if (catId) {
        await pool.query(
          `INSERT INTO category_tag_rel (category_id, tag_id, priority)
           VALUES ($1, $2, 0)
           ON CONFLICT (category_id, tag_id) DO NOTHING`,
          [catId, id]
        );
      }
    } catch {
      // Table may not exist yet — non-fatal
    }

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Tag slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating tag',
      error: error.message
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tags WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tag',
      error: error.message
    });
  }
};

/**
 * GET /api/tag/by-category/:categoryId
 *
 * Returns all tags associated with the given category.
 * Tags are sourced from two places and merged (deduplicated):
 *   1. tags.category_id = categoryId  (direct assignment via migration 004)
 *   2. category_tag_rel rows for categoryId (many-to-many via migration 005)
 *
 * Results from the relationship table are ordered by priority (ascending),
 * followed by any remaining directly-assigned tags ordered by id.
 *
 * Requirements: 5.1, 6.6, 8.8
 */
const getTagsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid categoryId is required'
      });
    }

    // Fetch tags from the relationship table (priority-ordered)
    const relResult = await pool.query(
      `SELECT t.*, ctr.priority
       FROM tags t
       INNER JOIN category_tag_rel ctr ON ctr.tag_id = t.id
       WHERE ctr.category_id = $1
       ORDER BY ctr.priority ASC, t.id ASC`,
      [categoryId]
    );

    // Fetch tags directly assigned via category_id column
    const directResult = await pool.query(
      `SELECT t.*, NULL::integer AS priority
       FROM tags t
       WHERE t.category_id = $1`,
      [categoryId]
    );

    // Merge: relationship-table tags first, then direct tags not already included
    const relTagIds = new Set(relResult.rows.map((r) => r.id));
    const additionalTags = directResult.rows.filter((t) => !relTagIds.has(t.id));
    const tags = [...relResult.rows, ...additionalTags];

    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tags by category',
      error: error.message
    });
  }
};

/**
 * GET /api/tag/search?q=<query>
 *
 * Returns all tags whose name contains the search query (case-insensitive).
 * If no query is provided, returns all tags (same as getTags).
 *
 * Requirements: 5.1, 6.6
 */
const searchTags = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      // No query — return all tags
      const result = await pool.query(
        `SELECT * FROM tags ORDER BY id DESC`
      );
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const result = await pool.query(
      `SELECT * FROM tags
       WHERE name ILIKE $1
       ORDER BY id DESC`,
      [searchTerm]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching tags',
      error: error.message
    });
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  getTagsByCategory,
  searchTags
};
