const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategoryTagRelationship,
  deleteCategoryTagRelationship,
  getCategoryWithTags
} = require('../controller/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createCategory)
router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.put('/:id', authMiddleware, updateCategory)
router.delete('/:id', authMiddleware, deleteCategory)

// Category-tag relationship routes
router.get('/:id/tags', getCategoryWithTags)
router.post('/:categoryId/tags/:tagId', authMiddleware, createCategoryTagRelationship)
router.delete('/:categoryId/tags/:tagId', authMiddleware, deleteCategoryTagRelationship)

module.exports = router;
