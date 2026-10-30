const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadSingle } = require("../middleware/uploadMiddleware");

const {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost
} = require('../controller/postController');

router.post('/', authMiddleware, uploadSingle('featured_image'), createPost);
router.get('/', getAllPosts);
router.get('/:slug', getSinglePost);
router.put('/:id', authMiddleware, uploadSingle('featured_image'), updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
