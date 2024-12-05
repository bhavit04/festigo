const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Event = require('../models/Event');
const { authMiddleware } = require('./auth');

// Move the cleanup route BEFORE other conversation routes
router.post('/conversations/cleanup', authMiddleware, async (req, res) => {
  try {
    const { collegeId, brandId, eventId } = req.body;
    console.log('Cleanup request received:', { collegeId, brandId, eventId });
    
    // Find all conversations matching the criteria
    const conversations = await Conversation.find({
      college: collegeId,
      brand: brandId,
      event: eventId
    }).sort({ createdAt: 1 }); // Sort by creation date

    console.log('Found conversations:', conversations.length);

    // If there are duplicates, keep the oldest one and remove others
    if (conversations.length > 1) {
      const [keep, ...duplicates] = conversations;
      console.log(`Found ${duplicates.length} duplicate conversations`);
      
      // Remove duplicates
      await Promise.all(duplicates.map(dup => 
        Conversation.findByIdAndDelete(dup._id)
      ));

      console.log('Duplicates removed');
    }

    res.json({ message: 'Cleanup completed', conversationsFound: conversations.length });
  } catch (error) {
    console.error('Error in cleanup:', error);
    res.status(500).json({ message: 'Failed to cleanup conversations' });
  }
});

// Then your other routes
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { collegeId, brandId, eventId, initialMessage } = req.body;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      college: collegeId,
      brand: brandId,
      event: eventId
    }).populate('event');

    if (conversation) {
      conversation = await conversation.populate(['college', 'brand', 'event']);
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      college: collegeId,
      brand: brandId,
      event: eventId,
      messages: []
    });

    // Add initial system message - simplified version
    const systemMessage = 'Conversation started';
    
    conversation.messages.push({
      sender: collegeId,
      senderType: 'system',
      content: systemMessage,
      timestamp: new Date(),
      isSystemMessage: true
    });

    conversation.lastMessage = {
      content: systemMessage,
      timestamp: new Date()
    };

    // Increment unread count for brand
    conversation.unreadCount.brand = 1;

    await conversation.save();
    conversation = await conversation.populate(['college', 'brand', 'event']);

    res.json(conversation);
  } catch (error) {
    console.error('Error in conversation creation:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

// Get conversations for college
router.get('/conversations/college/:collegeId', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching conversations for college:', req.params.collegeId);
    
    const conversations = await Conversation.find({ 
      college: req.params.collegeId 
    })
    .populate('brand', 'companyName')
    .populate('event', 'title description date sponsorshipNeeded')
    .populate('messages.sender', 'collegeName companyName')
    .sort('-updatedAt');

    console.log('Found conversations:', conversations.length);
    console.log('Conversation IDs:', conversations.map(c => ({
      id: c._id,
      brand: c.brand._id,
      event: c.event._id
    })));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching college conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Get conversations for brand
router.get('/conversations/brand/:brandId', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ brand: req.params.brandId })
      .populate('college', 'collegeName')
      .populate('event', 'title description date sponsorshipNeeded')
      .populate('messages.sender', 'collegeName companyName')
      .sort('-updatedAt');
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching brand conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Send message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId, senderId, senderType, content } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Add message
    conversation.messages.push({
      sender: senderId,
      senderType,
      content
    });

    // Update last message
    conversation.lastMessage = {
      content,
      timestamp: new Date()
    };

    // Update unread count for recipient
    const recipientType = senderType === 'college' ? 'brand' : 'college';
    conversation.unreadCount[recipientType]++;

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/conversations/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const { userType } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.unreadCount[userType] = 0;
    await conversation.save();
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

module.exports = router; 
