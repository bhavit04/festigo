const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  budgetRange: {
    type: String,
    enum: ['0-50000', '50000-200000', '200000+'],
    required: true
  },
  preferredEvents: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  requirements: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing; 
