const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { College, Brand } = require('../models/User');
const { authMiddleware } = require('./auth');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

console.log('Setting up event routes');

// Test route
router.get('/test', (req, res) => {
    console.log('Events test route hit');
    res.json({ message: 'Events router is working' });
});

// Get all events
router.get('/', authMiddleware, async (req, res) => {
    console.log('GET all events route hit');
    console.log('User from auth:', {
        id: req.user.id,
        role: req.user.role
    });
    
    try {
        const events = await Event.find()
            .populate('college', 'collegeName _id')
            .populate('interestedBrands.brand', 'brandName')
            .lean(); // Convert to plain JavaScript objects
        
        // Log each event's college information
        events.forEach(event => {
            console.log('Event details:', {
                eventId: event._id,
                eventTitle: event.title,
                collegeId: event.college?._id || event.college,
                collegeData: event.college
            });
        });
        
        res.json(events);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create a new event
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      college: req.user.id,
      image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null
    };

    const event = new Event(eventData);
    const newEvent = await event.save();
    
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get events for specific college (combine both /college routes)
router.get('/college', authMiddleware, async (req, res) => {
  console.log('GET /college route hit');
  
  try {
    // First, let's check if the user exists
    const college = await College.findById(req.user.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get events and ensure they're converted to plain objects
    const events = await Event.find({ college: req.user.id })
      .populate('interestedBrands.brand', 'brandName')
      .lean()  // Convert to plain JavaScript objects
      .sort({ createdAt: -1 });

    console.log('Found events:', events); // Debug log

    // Calculate stats with null checks
    const stats = events.reduce((acc, event) => {
      (event.interestedBrands || []).forEach(brand => {
        if (brand.status === 'completed') {
          acc.confirmedSponsors++;
          acc.totalRevenue += Number(brand.sponsorshipAmount) || 0;
        } else if (brand.status === 'accepted') {
          acc.potentialSponsors++;
        }
      });
      return acc;
    }, {
      confirmedSponsors: 0,
      potentialSponsors: 0,
      totalRevenue: 0
    });

    console.log('Calculated stats:', stats); // Debug log

    // Send response with both events and stats
    res.json({
      events: events || [], // Ensure events is always an array
      stats
    });

  } catch (err) {
    console.error('Error in /college route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update event
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, college: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    Object.keys(req.body).forEach(key => {
      event[key] = req.body[key];
    });

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      college: req.user.id 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Show interest in an event (for brands)
router.post('/:id/interest', authMiddleware, async (req, res) => {
  try {
    // Verify the user is a brand
    if (req.user.role !== 'brand') {
      return res.status(403).json({ message: 'Only brands can show interest in events' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if brand has already shown interest
    const alreadyInterested = event.interestedBrands.some(
      interest => interest.brand.toString() === req.user.id
    );

    if (alreadyInterested) {
      return res.status(400).json({ message: 'Already shown interest in this event' });
    }

    // Add brand to interested brands
    event.interestedBrands.push({
      brand: req.user.id,
      status: 'pending'
    });

    await event.save();

    // Populate brand details before sending response
    await event.populate('interestedBrands.brand', 'brandName');

    res.json({
      message: 'Interest shown successfully',
      interestedBrands: event.interestedBrands
    });
  } catch (error) {
    console.error('Error showing interest:', error);
    res.status(500).json({ message: 'Failed to show interest', error: error.message });
  }
});

// Get interested brands for an event (for college)
router.get('/:id/interests', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'interestedBrands.brand',
        model: 'User',
        select: 'companyName industry email role websiteUrl brandEmail'
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const populatedInterests = event.interestedBrands.map(interest => ({
      _id: interest._id,
      status: interest.status,
      sponsorshipAmount: interest.sponsorshipAmount || 0,
      dateInterested: interest.dateInterested,
      brand: {
        _id: interest.brand._id,
        companyName: interest.brand.companyName || 'Unknown Brand',
        industry: interest.brand.industry || 'N/A',
        email: interest.brand.brandEmail || interest.brand.email || 'N/A',
        websiteUrl: interest.brand.websiteUrl || 'N/A',
        role: interest.brand.role
      }
    }));

    console.log('Populated interests:', JSON.stringify(populatedInterests, null, 2));

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date
      },
      interestedBrands: populatedInterests
    });

  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ message: 'Failed to fetch interests' });
  }
});

// Update interest status (accept/reject/complete)
router.patch('/:id/interests/:brandId', authMiddleware, async (req, res) => {
  try {
    const { status, sponsorshipAmount } = req.body;

    // Validate status
    if (!['accepted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findOne({ 
      _id: req.params.id,
      college: req.user.id 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find and update the interest
    const interest = event.interestedBrands.find(
      interest => interest.brand.toString() === req.params.brandId
    );

    if (!interest) {
      return res.status(404).json({ message: 'Brand interest not found' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['completed', 'rejected'],
      completed: [], // Cannot transition from completed
      rejected: [] // Cannot transition from rejected
    };

    if (!validTransitions[interest.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${interest.status} to ${status}` 
      });
    }

    // Update status and amount if provided
    interest.status = status;
    if (sponsorshipAmount !== undefined) {
      interest.sponsorshipAmount = sponsorshipAmount;
    }

    // If status is changing to 'completed', update brand metrics
    if (status === 'completed') {
      try {
        const brand = await Brand.findById(req.params.brandId);
        if (brand) {
          brand.metrics = brand.metrics || {};
          brand.metrics.eventsSponsored = (brand.metrics.eventsSponsored || 0) + 1;
          brand.metrics.totalInvestment = (brand.metrics.totalInvestment || 0) + 
            (interest.sponsorshipAmount || 0);
          await brand.save();
        }
      } catch (error) {
        console.error('Failed to update brand metrics:', error);
      }
    }

    await event.save();

    // Populate brand details before sending response
    await event.populate('interestedBrands.brand', 'brandName description');

    res.json({
      message: `Interest ${status} successfully`,
      interestedBrands: event.interestedBrands
    });
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ message: 'Failed to update interest' });
  }
});

// Show interest in event
router.post('/:id/interests', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get brand data
    const brand = await Brand.findById(req.user.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Check if brand already showed interest
    const existingInterest = event.interestedBrands.find(
      interest => interest.brand.toString() === req.user.id
    );

    if (existingInterest) {
      return res.status(400).json({ message: 'Already showed interest in this event' });
    }

    // Add new interest with sponsorship amount
    const sponsorshipAmount = parseFloat(req.body.sponsorshipAmount) || 0;
    event.interestedBrands.push({
      brand: req.user.id,
      status: 'pending',
      sponsorshipAmount: sponsorshipAmount
    });

    await event.save();
    
    // Populate and return the new interest with full brand details
    await event.populate({
      path: 'interestedBrands.brand',
      select: 'companyName industry brandEmail websiteUrl description email'
    });
    
    const newInterest = event.interestedBrands[event.interestedBrands.length - 1];
    
    res.status(201).json({
      message: 'Interest shown successfully',
      interest: {
        ...newInterest.toObject(),
        brand: {
          _id: brand._id,
          companyName: brand.companyName,
          industry: brand.industry,
          email: brand.email || brand.brandEmail,
          websiteUrl: brand.websiteUrl,
          description: brand.description
        }
      }
    });
  } catch (error) {
    console.error('Error showing interest:', error);
    res.status(500).json({ message: 'Failed to show interest' });
  }
});

// Get events for specific brand
router.get('/brand', authMiddleware, async (req, res) => {
  try {
    // Find all events where this brand is in interestedBrands
    const events = await Event.find({
      'interestedBrands.brand': req.user.id
    })
    .populate('college', 'collegeName')
    .lean();

    // Add status information for each event
    const eventsWithStatus = events.map(event => {
      const brandInterest = event.interestedBrands.find(
        interest => interest.brand.toString() === req.user.id
      );
      return {
        ...event,
        status: brandInterest ? brandInterest.status : 'unknown'
      };
    });

    res.json(eventsWithStatus);
  } catch (error) {
    console.error('Error fetching brand events:', error);
    res.status(500).json({ message: 'Failed to fetch brand events' });
  }
});

console.log('Event routes set up:', 
    router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods)} ${r.route.path}`)
);

module.exports = router;
