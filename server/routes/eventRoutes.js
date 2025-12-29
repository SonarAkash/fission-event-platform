const express = require('express');
const router = express.Router();
const { createEvent, getEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Route: Anyone can view events
router.get('/', getEvents);

// Protected Route: Only logged-in users can create events
// 'image' is the key name expected in the form-data
router.post('/', protect, upload.single('image'), createEvent);

module.exports = router;