const express = require('express');
const BookingController = require('../controllers/booking.controller');

const router = express.Router();

// GET /api/bookings - List all bookings
router.get('/', BookingController.getBookings);

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', BookingController.getBookingById);

// POST /api/bookings - Create new booking with conflict validation
router.post('/', BookingController.createBooking);

// PATCH /api/bookings/:id - Update booking
router.patch('/:id', BookingController.updateBooking);

// DELETE /api/bookings/:id - Cancel booking and free vehicle
router.delete('/:id', BookingController.deleteBooking);

module.exports = router;
