const express = require('express');
const router = express.Router();
const { createEvent, getEvents, rsvpEvent, leaveEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Route: Anyone can view events
router.get('/', getEvents);

// Protected Route: Only logged-in users can create events
// 'image' is the key name expected in the form-data
router.post('/', protect, upload.single('image'), createEvent);


// Private: RSVP (The Atomic One)
router.post('/:id/rsvp', protect, rsvpEvent);

// Private
router.post('/:id/leave', protect, leaveEvent);

// Private: Delete (Owner only)
router.delete('/:id', protect, deleteEvent);

module.exports = router;