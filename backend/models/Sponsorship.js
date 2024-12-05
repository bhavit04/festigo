const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  brandId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'rejected'],
    default: 'pending'
  },
  amount: { 
    type: Number, 
    required: true 
  },
  deliverables: [{
    item: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'completed'],
      default: 'pending'
    }
  }],
  metrics: {
    footfall: Number,
    socialMediaReach: String,
    brandVisibility: String,
    roi: String
  },
  feedback: String,
  contactPerson: {
    name: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);
module.exports = Sponsorship;
