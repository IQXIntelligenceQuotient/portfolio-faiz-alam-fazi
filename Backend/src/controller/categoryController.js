const pool = require('../config/db');
const generateSlug = require('../utils/generateSlug');

const getUniqueCategorySlug = async (baseSlug, currentCategoryId = null) => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = `SELECT id FROM categories WHERE slug = $1`;
    const values = [uniqueSlug];

    if (currentCategoryId) {
      query += ` AND id != $2`;
      values.push(currentCategoryId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const rawSlug = slug && slug.trim() ? slug : name;
    const baseSlug = generateSlug(rawSlug) || `category-${Date.now()}`;
    const finalSlug = await getUniqueCategorySlug(baseSlug);

    const result = await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       RETURNING *`,
      [name, finalSlug]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Category slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      categories: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM categories WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const rawSlug = slug && slug.trim() ? slug : name;
    const baseSlug = generateSlug(rawSlug) || `category-${Date.now()}`;
    const finalSlug = await getUniqueCategorySlug(baseSlug, id);

    const result = await pool.query(
      `UPDATE categories
       SET name = $1,
           slug = $2
       WHERE id = $3
       RETURNING *`,
      [name, finalSlug, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Category slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// ─── Category-Tag Relationship Methods ───────────────────────────────────────

/**
 * POST /api/category/:categoryId/tags/:tagId
 * Creates a relationship between a category and a tag with an optional priority.
 * Lower priority number = higher priority (default 0).
 */
const createCategoryTagRelationship = async (req, res) => {
  try {
    const { categoryId, tagId } = req.params;
    const { priority = 0 } = req.body;

    // Validate that the category exists
    const categoryCheck = await pool.query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Validate that the tag exists
    const tagCheck = await pool.query(
      `SELECT id FROM tags WHERE id = $1`,
      [tagId]
    );
    if (tagCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Insert or update the relationship (upsert)
    const result = await pool.query(
      `INSERT INTO category_tag_rel (category_id, tag_id, priority)
       VALUES ($1, $2, $3)
       ON CONFLICT (category_id, tag_id)
       DO UPDATE SET priority = EXCLUDED.priority
       RETURNING *`,
      [categoryId, tagId, priority]
    );

    res.status(201).json({
      success: true,
      message: 'Category-tag relationship created successfully',
      relationship: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category-tag relationship',
      error: error.message
    });
  }
};

/**
 * DELETE /api/category/:categoryId/tags/:tagId
 * Removes the relationship between a category and a tag.
 */
const deleteCategoryTagRelationship = async (req, res) => {
  try {
    const { categoryId, tagId } = req.params;

    const result = await pool.query(
      `DELETE FROM category_tag_rel
       WHERE category_id = $1 AND tag_id = $2
       RETURNING *`,
      [categoryId, tagId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category-tag relationship not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category-tag relationship deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category-tag relationship',
      error: error.message
    });
  }
};

/**
 * GET /api/category/:id/tags
 * Retrieves a category along with all its associated tags, ordered by priority
 * (lower number = higher priority, then alphabetically by tag name).
 */
const getCategoryWithTags = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the category
    const categoryResult = await pool.query(
      `SELECT * FROM categories WHERE id = $1`,
      [id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Fetch associated tags ordered by priority, then name
    const tagsResult = await pool.query(
      `SELECT t.*, ctr.priority
       FROM tags t
       INNER JOIN category_tag_rel ctr
         ON t.id = ctr.tag_id
       WHERE ctr.category_id = $1
       ORDER BY ctr.priority ASC, t.name ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      category: categoryResult.rows[0],
      tags: tagsResult.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category with tags',
      error: error.message
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategoryTagRelationship,
  deleteCategoryTagRelationship,
  getCategoryWithTags
};
