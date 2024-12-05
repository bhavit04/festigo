const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('BaseUrl:', req.baseUrl);
    next();
});

// Test route at root level
app.get('/test', (req, res) => {
    console.log('Root test route hit');
    res.json({ message: 'Server is working' });
});

// Import and mount routes
const eventRoutes = require('./routes/events');
console.log('Registering event routes...');
app.use('/api/events', eventRoutes);
console.log('Event routes registered');

const messageRoutes = require('./routes/messages');
console.log('Registering message routes...');
app.use('/api', messageRoutes);
console.log('Message routes registered');

// Route not found handler
app.use((req, res) => {
    console.log('No route matched:', req.method, req.path);
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\nServer is running on port ${PORT}`);
    console.log('Available routes:');
    app._router.stack
        .filter(r => r.route)
        .forEach(r => {
            console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
        });
});

module.exports = app;
