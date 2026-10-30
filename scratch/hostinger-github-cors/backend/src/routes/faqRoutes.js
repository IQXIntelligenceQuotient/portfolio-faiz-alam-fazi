const express = require('express');
const router = express.Router();
const { createFaq, getFaqsByPost, updateFaq, deleteFaq } = require('../controller/faqController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createFaq);
router.get('/:post_id', getFaqsByPost);
router.put('/:id', authMiddleware, updateFaq);
router.delete('/:id', authMiddleware, deleteFaq);

module.exports = router;
