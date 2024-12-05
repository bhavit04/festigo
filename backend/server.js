require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import models first
require('./models/User');  // This needs to be first as Event depends on it
require('./models/Event');

// Then import routes
const { router: authRoutes } = require('./routes/auth');
const brandRoutes = require('./routes/brand');
const listingRoutes = require('./routes/listing');
const proposalRoutes = require('./routes/proposal');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/proposals');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Debug middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', messageRoutes);

// Static file serving - update the path to be absolute
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add this after your middleware and before your routes
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 
