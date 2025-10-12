// server/routes/ai.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');
const { protect } = require('../middleware/auth'); // 复用你已有的认证中间件

// POST /api/ai/chat
router.post('/chat', protect, aiController.handleChat);

module.exports = router;
