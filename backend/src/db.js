const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!config.mongoUri) {
    console.error('❌  MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    console.log('✅  MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
