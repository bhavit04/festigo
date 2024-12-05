const mongoose = require('mongoose');

// Base Schema with common fields
const baseSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['college', 'brand'] }
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

// Create the base model
const User = mongoose.model('User', baseSchema);

// College Schema
const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  position: { type: String, required: true },
  eventType: { type: String, required: true },
  contactEmail: { type: String, required: true },
  authorization: { type: Boolean, required: true },
  eventFrequency: { type: String, required: true }
});

// Brand Schema
const brandSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  industry: { type: String, required: true },
  gstin: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  brandEmail: { type: String, required: true },
  authorization: { type: Boolean, required: true },
  sponsorshipPreferences: {
    eventTypes: [String],
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    preferredRegions: [String]
  },
  team: [{
    name: { type: String },
    role: { type: String },
    email: { type: String }
  }],
  metrics: {
    totalInvestment: { type: Number, default: 0 },
    eventsSponsored: { type: Number, default: 0 }
  }
});

// Create discriminator models
const College = User.discriminator('college', collegeSchema);
const Brand = User.discriminator('brand', brandSchema);

module.exports = { User, College, Brand }; 
