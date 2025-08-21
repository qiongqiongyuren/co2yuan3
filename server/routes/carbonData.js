const express = require('express');
const router = express.Router();
const { submitData, getData, getDataByYear, deleteDataById, updateDataById } = require('../controllers/carbonData');
const { protect } = require('../middleware/auth'); // Assuming auth middleware exists

// POST route to submit data
router.post('/', protect, submitData);

// GET route to fetch all data for the user (e.g., for reports)
router.get('/', protect, getData);

// GET route to fetch single data entry by year
router.get('/:year', protect, getDataByYear);

// PUT route to update a single data entry by its ID
router.put('/:id', protect, updateDataById);

// DELETE route to delete a single data entry by its ID
router.delete('/:id', protect, deleteDataById);

module.exports = router;
