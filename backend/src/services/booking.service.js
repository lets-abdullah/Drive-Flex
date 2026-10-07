const BookingModel = require('../models/booking.model');
const VehicleModel = require('../models/vehicle.model');

const BookingService = {
  /**
   * Get all bookings
   */
  getAllBookings: async (filter = {}) => {
    return await BookingModel.findAll(filter);
  },

  /**
   * Get single booking by ID
   */
  getBookingById: async (id) => {
    return await BookingModel.findById(id);
  },

  /**
   * Create a new booking with double-booking prevention
   */
  createBooking: async (bookingData) => {
    const { vehicleId, customer, pickup, returnDate, totalAmount } = bookingData;

    // 1. Validate required fields
    if (!vehicleId || !customer || !pickup || !returnDate) {
      const error = new Error('Vehicle ID, customer name, pickup date, and return date are required.');
      error.status = 400;
      error.code = 'INVALID_BOOKING_DATA';
      throw error;
    }

    // 2. Validate vehicle exists
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found.');
      error.status = 404;
      error.code = 'VEHICLE_NOT_FOUND';
      throw error;
    }

    // 3. CRITICAL: Atomic availability check to prevent double booking / race conditions
    const existingActiveBooking = await BookingModel.findActiveByVehicleId(vehicleId);
    if (existingActiveBooking) {
      const error = new Error('This vehicle has already been booked by another customer.');
      error.status = 409; // Conflict
      error.code = 'VEHICLE_ALREADY_BOOKED';
      error.existingBooking = {
        customer: existingActiveBooking.customer,
        pickup: existingActiveBooking.pickup,
        returnDate: existingActiveBooking.returnDate,
      };
      throw error;
    }

    // 4. Calculate total if not provided
    let calculatedTotal = totalAmount;
    if (!calculatedTotal) {
      const start = new Date(`${pickup}T12:00:00`).getTime();
      const end = new Date(`${returnDate}T12:00:00`).getTime();
      const days = Math.max(1, Math.ceil((end - start) / 86400000));
      calculatedTotal = days * vehicle.pricePerDay;
    }

    // 5. Persist the booking
    const newBooking = await BookingModel.create({
      vehicleId,
      customer,
      pickup,
      returnDate,
      totalAmount: calculatedTotal,
      status: 'Confirmed',
    });

    return newBooking;
  },

  /**
   * Update booking status
   */
  updateBooking: async (id, updateData) => {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.status = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    return await BookingModel.update(id, updateData);
  },

  /**
   * Cancel/delete booking (frees the vehicle)
   */
  cancelBooking: async (id) => {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.status = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    // Mark as cancelled or delete
    return await BookingModel.delete(id);
  },
};

module.exports = BookingService;
