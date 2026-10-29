const express = require('express');
const router = express.Router();
const {loginAdmin, verifyAdmin} = require('../controller/authController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginAdmin)
router.get('/verify', authMiddleware, verifyAdmin)

module.exports = router;
