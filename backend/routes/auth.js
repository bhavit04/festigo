const express = require('express');
const bcrypt = require('bcrypt');
const { User, College, Brand } = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    console.log('Backend - Received request body:', req.body);

    const {
      fullName,
      email,
      password,
      role,
      // College-specific fields
      collegeName,
      position,
      eventType,
      contactEmail,
      authorization,
      eventFrequency,
      // Brand-specific fields
      companyName,
      industry,
      gstin,
      websiteUrl,
      brandEmail
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user based on role
    let user;
    if (role === 'college') {
      user = new College({
        fullName,
        email,
        password: hashedPassword,
        role,
        collegeName,
        position,
        eventType,
        contactEmail,
        authorization,
        eventFrequency
      });
    } else if (role === 'brand') {
      user = new Brand({
        fullName,
        email,
        password: hashedPassword,
        role,
        companyName,
        industry,
        gstin,
        websiteUrl,
        brandEmail,
        authorization,
        sponsorshipPreferences: {
          eventTypes: [],
          budgetRange: {
            min: 0,
            max: 0
          },
          preferredRegions: []
        },
        team: [],
        metrics: {
          totalInvestment: 0,
          eventsSponsored: 0
        }
      });
    }

    console.log('Backend - User model instance:', user);

    const savedUser = await user.save();
    console.log('Backend - Saved user:', savedUser);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Backend - Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email (will search in both collections)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Send user data (excluding sensitive information)
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      ...(user.role === 'college' 
        ? {
            collegeName: user.collegeName,
            position: user.position,
            eventType: user.eventType,
            contactEmail: user.contactEmail,
            authorization: user.authorization,
            eventFrequency: user.eventFrequency
          }
        : {
            companyName: user.companyName,
            industry: user.industry,
            gstin: user.gstin,
            websiteUrl: user.websiteUrl,
            brandEmail: user.brandEmail
          })
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),  // Convert ObjectId to string
        role: user.role 
      },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful',
      user: userData,
      token    // Add token to response
    });
    
  } catch (error) {
    console.error('Server login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




const authMiddleware = (req, res, next) => {
    console.log('A. Starting auth middleware');
    try {
        const authHeader = req.headers.authorization;
        console.log('B. Auth header:', authHeader);

        if (!authHeader) {
            console.log('C. No auth header found');
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        console.log('D. Token extracted:', token ? 'Token exists' : 'No token');

        if (!token) {
            console.log('E. No token found');
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        console.log('F. Decoded token:', decoded);
        
        req.user = {
            id: String(decoded.id),
            role: decoded.role
        };

        console.log('G. User set on request:', req.user);
        next();
    } catch (error) {
        console.error('H. Auth middleware error:', {
            error: error,
            message: error.message,
            stack: error.stack
        });
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

// Export both router and middleware
module.exports = {
  router,
  authMiddleware
}; 
