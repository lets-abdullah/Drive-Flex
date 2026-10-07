/**
 * Centralized Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
  };

  if (err.existingBooking) {
    response.existingBooking = err.existingBooking;
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error('API Error:', err);
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
