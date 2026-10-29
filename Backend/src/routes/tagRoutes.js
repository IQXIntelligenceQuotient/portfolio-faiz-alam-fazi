const express = require('express');
const router = express.Router();
const { createTag, getTags, updateTag, deleteTag, getTagsByCategory, searchTags } = require('../controller/tagController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTag)
router.get('/', getTags)

// Static routes must be declared before parameterised routes to avoid
// Express treating 'search' or 'by-category' as an :id value.
router.get('/search', searchTags)
router.get('/by-category/:categoryId', getTagsByCategory)

router.put('/:id', authMiddleware, updateTag)
router.delete('/:id', authMiddleware, deleteTag)

module.exports = router;
