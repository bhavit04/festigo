const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { authMiddleware } = require('./auth');

// Create a new listing (protected route)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    // Add debug logging
    console.log('Creating new listing');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const {
      brandId,
      brandName,
      industry,
      budgetRange,
      preferredEvents,
      description,
      requirements
    } = req.body;

    // Validate required fields
    if (!brandId || !brandName || !industry || !budgetRange) {
      console.log('Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        received: { brandId, brandName, industry, budgetRange }
      });
    }

    // Create new listing
    const listing = new Listing({
      brandId,
      brandName,
      industry,
      budgetRange,
      preferredEvents: preferredEvents || [],
      description: description || '',
      requirements: requirements || '',
      status: 'active'
    });

    console.log('Listing to be saved:', listing);

    // Save the listing
    const savedListing = await listing.save();
    console.log('Listing saved successfully:', savedListing);

    res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all listings with optional filters
router.get('/', async (req, res) => {
  try {
    console.log('Fetching listings with query:', req.query);
    const { industry, budgetRange } = req.query;
    let query = { status: 'active' }; // Only fetch active listings

    if (industry && industry !== 'all') {
      query.industry = industry;
    }
    if (budgetRange && budgetRange !== 'all') {
      query.budgetRange = budgetRange;
    }

    console.log('Final query:', query);
    const listings = await Listing.find(query)
      .populate('brandId', 'companyName industry')
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log(`Found ${listings.length} listings`);
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get listings for a specific brand
router.get('/brand/:brandId', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching listings for brand:', req.params.brandId);
    const listings = await Listing.find({ 
      brandId: req.params.brandId 
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${listings.length} listings for brand`);
    res.json(listings);
  } catch (error) {
    console.error('Error fetching brand listings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific listing by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching listing:', req.params.id);
    const listing = await Listing.findById(req.params.id)
      .populate('brandId', 'companyName industry');
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
