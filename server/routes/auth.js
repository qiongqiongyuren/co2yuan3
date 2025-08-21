const express = require('express');
const router = express.Router();

// Import controller
const { login, register } = require('../controllers/auth');

// Define routes
router.post('/login', login);
router.post('/register', register); // Optional: for creating accounts

module.exports = router;
