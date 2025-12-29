const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  // Check if file was uploaded
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  const event = await Event.create({
    title,
    description,
    date: new Date(date),
    location,
    capacity,
    imageUrl: req.file.path, // Cloudinary URL
    organizer: req.user._id, // From the auth middleware
    attendees: [], // Start empty
  });

  res.status(201).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // Sort by date (newest first) and populate organizer name
  const events = await Event.find({})
    .sort({ date: 1 }) 
    .populate('organizer', 'name email');

  res.json(events);
});

module.exports = { createEvent, getEvents };