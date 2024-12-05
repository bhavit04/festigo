const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['college', 'brand', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  lastMessage: {
    content: String,
    timestamp: Date
  },
  unreadCount: {
    college: { type: Number, default: 0 },
    brand: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema); 
