const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!config.mongoUri) {
    console.warn('⚠️  MONGO_URI is not set in .env — running in in-memory fallback mode.');
    return;
  }

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 4000 });
    isConnected = true;
    console.log('✅  MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed, using in-memory seed fallback:', err.message);
  }
};

module.exports = connectDB;
