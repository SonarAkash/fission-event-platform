const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true }, // The limit (e.g., 50 spots)
  imageUrl: { type: String, required: true }, // Cloudinary URL
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;