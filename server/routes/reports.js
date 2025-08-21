const express = require('express');
const router = express.Router();
const { exportCsv, compareData } = require('../controllers/reports');
const { protect } = require('../middleware/auth');

// @desc    Export user data to CSV
// @route   GET /api/reports/csv
// @access  Private
router.get('/csv', protect, exportCsv);

// @desc    Get comparison data
// @route   GET /api/reports/compare
// @access  Private
router.get('/compare', protect, compareData);

module.exports = router;
