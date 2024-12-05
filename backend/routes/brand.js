const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { Brand } = require('../models/User');
const Sponsorship = require('../models/Sponsorship');
const { authMiddleware } = require('./auth');

console.log('Loading brand routes...');

// 1. Debug middleware - FIRST
router.use((req, res, next) => {
  console.log('Brand route accessed:', {
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    headers: req.headers
  });
  next();
});

// 2. Public test route
router.get('/test', (req, res) => {
  console.log('Brand test route hit');
  return res.status(200).json({ 
    message: 'Brand routes are working',
    timestamp: new Date().toISOString()
  });
});

// 3. Auth middleware
router.use(authMiddleware);

// 4. Role check middleware
const isBrand = (req, res, next) => {
  console.log('Checking brand role:', req.user);
  if (!req.user) {
    console.log('No user object found in request');
    return res.status(401).json({ error: 'No user found' });
  }
  if (req.user.role !== 'brand') {
    console.log('Access denied: User is not a brand');
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// 5. Apply role check to all protected routes
router.use(isBrand);

// 6. Debug check for models
console.log('Models loaded:', {
  hasBrand: !!Brand,
  hasSponsorship: !!Sponsorship
});

// 7. Get brand dashboard data
router.get('/:brandId/dashboard', async (req, res) => {
  try {
    console.log('1. Starting dashboard route');
    
    const brandId = req.params.brandId;
    const userId = req.user?.id;

    console.log('2. IDs received:', { brandId, userId });

    // Validate IDs
    if (!brandId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required IDs',
        brandId: !!brandId,
        userId: !!userId
      });
    }

    // Convert to ObjectId safely
    let brandObjectId;
    try {
      brandObjectId = new mongoose.Types.ObjectId(brandId);
      console.log('3. ObjectId created:', brandObjectId);
    } catch (err) {
      console.error('ObjectId conversion failed:', err);
      return res.status(400).json({ 
        error: 'Invalid ID format',
        details: err.message 
      });
    }

    // Find brand
    const brand = await Brand.findById(brandObjectId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    console.log('4. Brand found:', {
      id: brand._id,
      hasMetrics: !!brand.metrics,
      hasPreferences: !!brand.sponsorshipPreferences
    });

    // Prepare response data with null checks
    const responseData = {
      metrics: {
        totalInvestment: brand.metrics?.totalInvestment ?? 0,
        eventsSponsored: brand.metrics?.eventsSponsored ?? 0
      },
      preferences: {
        eventTypes: brand.sponsorshipPreferences?.eventTypes ?? [],
        budgetRange: brand.sponsorshipPreferences?.budgetRange ?? { min: 0, max: 0 },
        preferredRegions: brand.sponsorshipPreferences?.preferredRegions ?? []
      },
      activeSponshorships: [],
      pendingSponshorships: []
    };

    console.log('5. Response data prepared:', responseData);

    // Fetch sponsorships with explicit ObjectId
    const [activeSponshorships, pendingSponshorships] = await Promise.all([
      Sponsorship.find({
        brandId: brandObjectId,
        status: 'active'
      }).populate('eventId').lean(),
      Sponsorship.find({
        brandId: brandObjectId,
        status: 'pending'
      }).populate('eventId').lean()
    ]);

    console.log('6. Sponsorships found:', {
      activeCount: activeSponshorships?.length ?? 0,
      pendingCount: pendingSponshorships?.length ?? 0
    });

    responseData.activeSponshorships = activeSponshorships ?? [];
    responseData.pendingSponshorships = pendingSponshorships ?? [];

    return res.json(responseData);

  } catch (error) {
    console.error('Dashboard data fetch error:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 8. Update brand preferences
router.patch('/:brandId/preferences', async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const { eventTypes, budgetRange, preferredRegions } = req.body;

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      {
        'sponsorshipPreferences.eventTypes': eventTypes,
        'sponsorshipPreferences.budgetRange': budgetRange,
        'sponsorshipPreferences.preferredRegions': preferredRegions
      },
      { new: true }
    );

    res.json(updatedBrand.sponsorshipPreferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Manage team members
router.post('/:brandId/team', async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const { name, role, email } = req.body;

    const brand = await Brand.findById(brandId);
    brand.team.push({ name, role, email });
    await brand.save();

    res.json(brand.team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Remove team member
router.delete('/:brandId/team/:memberId', async (req, res) => {
  try {
    const { brandId, memberId } = req.params;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Ensure member exists before calling toString()
    brand.team = brand.team.filter(member => member._id && member._id.toString() !== memberId);
    await brand.save();

    res.json(brand.team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Create sponsorship request
router.post('/sponsorship/request', async (req, res) => {
  try {
    const { eventId, brandId, amount, deliverables } = req.body;

    const sponsorship = new Sponsorship({
      eventId,
      brandId,
      amount,
      deliverables: deliverables.map(item => ({ item })),
      status: 'pending'
    });

    await sponsorship.save();
    res.status(201).json(sponsorship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Update sponsorship status
router.patch('/sponsorship/:sponsorshipId/status', async (req, res) => {
  try {
    const { sponsorshipId } = req.params;
    const { status } = req.body;

    const sponsorship = await Sponsorship.findByIdAndUpdate(
      sponsorshipId,
      { status },
      { new: true }
    );

    if (!sponsorship) {
      return res.status(404).json({ error: 'Sponsorship not found' });
    }

    // Update brand metrics if sponsorship is completed
    if (status === 'completed') {
      const brand = await Brand.findById(sponsorship.brandId);
      if (brand) {
        brand.metrics.eventsSponsored += 1;
        brand.metrics.totalInvestment += sponsorship.amount;
        await brand.save();
      }
    }

    res.json(sponsorship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Get sponsorship history
router.get('/:brandId/sponsorships/history', async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const sponsorships = await Sponsorship.find({
      brandId,
      status: 'completed'
    }).populate('eventId');

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
