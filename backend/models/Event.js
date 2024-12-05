const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  sponsorshipNeeded: {
    type: Number,
    required: true
  },
  attendees: {
    type: Number,
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  },
  interestedBrands: [{
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'rejected'],
      default: 'pending'
    },
    sponsorshipAmount: {
      type: Number,
      default: 0
    },
    dateInterested: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
