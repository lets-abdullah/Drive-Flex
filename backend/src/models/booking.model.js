const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true },
    customer: { type: String, required: true },
    pickup: { type: String, required: true },
    returnDate: { type: String, required: true },
    status: { type: String, default: 'Confirmed' },
    totalAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

/* ------------------------------------------------------------------
 * Seed data – inserted once if the collection is empty
 * ------------------------------------------------------------------ */
const seedBookings = [
  {
    id: 'book-seed-001', vehicleId: 'v2', customer: 'Omar H.',
    pickup: '2026-10-22', returnDate: '2026-10-24',
    status: 'Confirmed', totalAmount: 690, notes: 'Pre-booked demo reservation',
  },
  {
    id: 'book-seed-002', vehicleId: 'v6', customer: 'Zainab R.',
    pickup: '2026-10-20', returnDate: '2026-10-25',
    status: 'Confirmed', totalAmount: 880, notes: 'Pre-booked demo reservation',
  },
];

const seedIfEmpty = async () => {
  const count = await Booking.countDocuments();
  if (count === 0) {
    await Booking.insertMany(seedBookings);
    console.log(`🌱  Seeded ${seedBookings.length} bookings into MongoDB`);
  }
};

/* ------------------------------------------------------------------
 * DAO – same interface as the old in-memory model
 * ------------------------------------------------------------------ */
const BookingModel = {
  findAll: async (filter = {}) => {
    await seedIfEmpty();
    const query = {};
    if (filter.vehicleId) query.vehicleId = filter.vehicleId;
    if (filter.status) query.status = filter.status;
    return Booking.find(query).lean();
  },

  findById: async (id) => {
    return Booking.findOne({ id }).lean();
  },

  findActiveByVehicleId: async (vehicleId) => {
    return Booking.findOne({
      vehicleId,
      status: { $in: ['Confirmed', 'Pending'] },
    }).lean();
  },

  create: async (bookingData) => {
    const newBooking = new Booking({
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Confirmed',
      ...bookingData,
    });
    return (await newBooking.save()).toObject();
  },

  update: async (id, updateData) => {
    return Booking.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  delete: async (id) => {
    const result = await Booking.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

module.exports = BookingModel;
