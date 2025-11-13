const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

// Import basic middleware
const rateLimit = require('express-rate-limit');

// Simple rate limiter
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Simple error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
};

// Simple 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
};

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());

// Rate limiting
app.use(generalApiLimiter);

// CORS configuration
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Import routes
const apiRoutes = require('./routes');

// Import and initialize content scraping scheduler
const { initializeScheduler } = require('./controllers/contentScrapingController');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FactSaura backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FactSaura backend server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);

  // Initialize content scraping scheduler
  initializeScheduler();
});

module.exports = app;