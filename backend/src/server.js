const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./db');
const vehicleRoutes = require('./routes/vehicle.routes');
const bookingRoutes = require('./routes/booking.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/demo, can restrict to config.frontendUrl in prod
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint (legacy)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check endpoint (OpenAPI spec — used by React Native and Next.js clients)
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Root info
app.get('/api', (req, res) => {
  res.json({
    name: 'DriveFlex Rentals API',
    version: '1.0.0',
    endpoints: {
      vehicles: '/api/vehicles',
      bookings: '/api/bookings',
    },
  });
});

// Mount Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🚗 DriveFlex Backend API running on port ${config.port}`);
      console.log(`📡 URL: http://localhost:${config.port}/api`);
      console.log(`===============================================`);
    });
  });
}

module.exports = app;
