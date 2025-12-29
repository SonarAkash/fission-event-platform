const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, capacity } = req.body;


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



// @desc    RSVP for an event
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const existingEvent = await Event.findById(eventId);
  if (!existingEvent) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (existingEvent.attendees.includes(userId)) {
    res.status(400);
    throw new Error('You have already RSVPd for this event');
  }

  // Atomically add attendee only if capacity is not exceeded
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }
    },
    {
      $push: { attendees: userId }
    },
    { new: true }
  );

  if (!event) {
    res.status(400);
    throw new Error('Event is fully booked');
  }

  res.json(event);
});



const leaveEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  // remove the user from the attendees array
  const event = await Event.findByIdAndUpdate(
    eventId,
    {
      $pull: { attendees: userId }
    },
    { new: true } 
  );

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});



// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Owner only)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this event');
  }

  let imageUrl = event.imageUrl;
  if (req.file) {
    try {
      if (event.imageUrl) {
        const parts = event.imageUrl.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filename}`;
        await cloudinary.uploader.destroy(publicId);
      }
      imageUrl = req.file.path;
    } catch (error) {
      console.error("Cloudinary Update Error:", error);
    }
  }

  event.title = req.body.title || event.title;
  event.description = req.body.description || event.description;
  event.date = req.body.date || event.date;
  event.location = req.body.location || event.location;
  event.capacity = req.body.capacity || event.capacity;
  event.imageUrl = imageUrl;

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});



// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Owner only)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Ensure only the organizer can delete the event
  if (event.organizer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this event');
  }

  if (event.imageUrl) {
    try {
      // Extract public_id from URL
      // Example URL: .../upload/v1234/fission-events/xyz123.jpg
      const parts = event.imageUrl.split('/');
      const filename = parts[parts.length - 1].split('.')[0]; // xyz123
      const folder = parts[parts.length - 2]; // fission-events
      const publicId = `${folder}/${filename}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
    }
  }

  await event.deleteOne();
  res.json({ message: 'Event removed' });
});

module.exports = { createEvent, getEvents, rsvpEvent, leaveEvent, updateEvent, deleteEvent };
