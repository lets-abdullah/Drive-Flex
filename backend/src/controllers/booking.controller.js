const BookingService = require('../services/booking.service');

const BookingController = {
  getBookings: async (req, res, next) => {
    try {
      const { vehicleId, status } = req.query;
      const bookings = await BookingService.getAllBookings({ vehicleId, status });
      res.json({
        success: true,
        data: bookings,
        count: bookings.length,
      });
    } catch (err) {
      next(err);
    }
  },

  getBookingById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const booking = await BookingService.getBookingById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  },

  createBooking: async (req, res, next) => {
    try {
      const { vehicleId, customer, pickup, returnDate, totalAmount } = req.body;
      const newBooking = await BookingService.createBooking({
        vehicleId,
        customer,
        pickup,
        returnDate,
        totalAmount,
      });

      res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully.',
        data: newBooking,
      });
    } catch (err) {
      next(err);
    }
  },

  updateBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await BookingService.updateBooking(id, req.body);

      res.json({
        success: true,
        message: 'Booking updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      await BookingService.cancelBooking(id);

      res.json({
        success: true,
        message: 'Booking cancelled successfully. Vehicle is now available.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BookingController;
