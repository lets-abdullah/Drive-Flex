const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI,
};
