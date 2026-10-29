const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  testEmail,
} = require('../controller/subscriberController');

// Public
router.post('/', subscribe);
router.delete('/unsubscribe/:email', unsubscribe);

// Admin only
router.get('/admin/all', authMiddleware, getAllSubscribers);
router.delete('/admin/:id', authMiddleware, deleteSubscriber);

// Admin: test SMTP connection and send a test email
router.post('/admin/test-email', authMiddleware, testEmail);

module.exports = router;
