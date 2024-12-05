const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const { authMiddleware } = require('./auth');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for PDF storage with absolute path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/proposals');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `proposal-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create a new proposal
router.post('/create', upload.single('proposalFile'), async (req, res) => {
  try {
    console.log('Received file upload request');
    console.log('Request body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Validate and convert IDs
    const listingId = mongoose.Types.ObjectId(req.body.listingId);
    const collegeId = mongoose.Types.ObjectId(req.body.collegeId);
    const brandId = mongoose.Types.ObjectId(req.body.brandId);

    const proposal = new Proposal({
      listingId,
      collegeId,
      brandId,
      proposalFile: req.file.path.replace(/\\/g, '/')
    });

    const savedProposal = await proposal.save();
    console.log('Proposal saved:', savedProposal);

    res.status(201).json({ message: 'Proposal uploaded successfully' });
  } catch (error) {
    console.error('Error in proposal upload:', error);
    if (error.name === 'BSONError' || error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format provided' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get proposals for a listing
router.get('/listing/:listingId', authMiddleware, async (req, res) => {
  try {
    const proposals = await Proposal.find({ listingId: req.params.listingId })
      .populate('collegeId', 'collegeName position eventType');
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update proposal status
router.patch('/:proposalId/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.proposalId,
      { status },
      { new: true }
    );
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
