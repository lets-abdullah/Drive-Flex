const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    car_id: { type: String, required: true },
    vehicleId: { type: String, required: true },
    renter_id: { type: String, required: true, default: 'usr-renter-demo' },
    host_id: { type: String, required: true, default: 'owner-ali' },
    start_date: { type: String, required: true },
    pickup: { type: String, required: true },
    end_date: { type: String, required: true },
    returnDate: { type: String, required: true },
    total_price: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    payment_status: {
      type: String,
      required: true,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'paid',
    },
    customer: { type: String, required: true, default: 'Renter Customer' },
    renter_name: { type: String, default: 'Renter Customer' },
    renter_phone: { type: String, default: '+92 300 1234567' },
    renter_email: { type: String, default: 'renter@driveflex.pk' },
    host_name: { type: String, default: 'Ali Motors' },
    host_phone: { type: String, default: '+92 321 9876543' },
    car_title: { type: String, default: 'Executive Sedan' },
    car_image: { type: String, default: '' },
    pickup_address: { type: String, default: 'Central Terminal' },
    pickup_time: { type: String, default: '10:00 AM' },
    return_time: { type: String, default: '06:00 PM' },
    cancellation_reason: { type: String, default: '' },
    refund_status: { type: String, default: 'N/A' },
    review_rating: { type: Number, default: 0 },
    review_comment: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

bookingSchema.index({ host_id: 1, status: 1 });
bookingSchema.index({ renter_id: 1, status: 1 });
bookingSchema.index({ car_id: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

/* ------------------------------------------------------------------
 * Seed data – Segmented across host and renter workflows
 * ------------------------------------------------------------------ */
const seedBookings = [
  // 1. Pending Request (waiting for Host manual approval)
  {
    id: 'book-req-001',
    car_id: 'v-mb-c-class',
    vehicleId: 'v-mb-c-class',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    start_date: '2026-10-18',
    pickup: '2026-10-18',
    end_date: '2026-10-21',
    returnDate: '2026-10-21',
    total_price: 243,
    totalAmount: 243,
    status: 'pending',
    payment_status: 'paid',
    customer: 'Farhan Malik',
    renter_name: 'Farhan Malik',
    renter_phone: '+92 302 5551234',
    renter_email: 'farhan@gmail.com',
    host_name: 'Ali Motors',
    host_phone: '+92 321 9876543',
    car_title: 'Mercedes-Benz C-Class',
    car_image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
    pickup_address: 'Bosan Road Executive Suites, Multan',
    pickup_time: '11:00 AM',
    return_time: '04:00 PM',
    notes: 'Airport executive transfer requested',
  },
  // 2. Upcoming Confirmed Booking
  {
    id: 'book-upc-002',
    car_id: 'v-bmw-3-series',
    vehicleId: 'v-bmw-3-series',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    start_date: '2026-10-24',
    pickup: '2026-10-24',
    end_date: '2026-10-27',
    returnDate: '2026-10-27',
    total_price: 285,
    totalAmount: 285,
    status: 'confirmed',
    payment_status: 'paid',
    customer: 'Sarah Ahmed',
    renter_name: 'Sarah Ahmed',
    renter_phone: '+92 333 4447890',
    renter_email: 'sarah.ahmed@outlook.com',
    host_name: 'Ali Motors',
    host_phone: '+92 321 9876543',
    car_title: 'BMW 3-Series M Sport',
    car_image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    pickup_address: 'Main Boulevard, Gulberg III, Lahore',
    pickup_time: '10:00 AM',
    return_time: '06:00 PM',
    notes: 'Confirmed luxury weekend rental',
  },
  // 3. Active Booking (Trip Currently In Progress)
  {
    id: 'book-act-003',
    car_id: 'v-hyundai-sonata',
    vehicleId: 'v-hyundai-sonata',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    start_date: '2026-10-10',
    pickup: '2026-10-10',
    end_date: '2026-10-14',
    returnDate: '2026-10-14',
    total_price: 300,
    totalAmount: 300,
    status: 'active',
    payment_status: 'paid',
    customer: 'Taimoor Shah',
    renter_name: 'Taimoor Shah',
    renter_phone: '+92 312 8889900',
    renter_email: 'taimoor@yahoo.com',
    host_name: 'Ali Motors',
    host_phone: '+92 321 9876543',
    car_title: 'Hyundai Sonata Executive',
    car_image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    pickup_address: 'Multan International Airport Terminal, Multan',
    pickup_time: '09:00 AM',
    return_time: '08:00 PM',
    notes: 'Active live trip across Multan Cantt',
  },
  // 4. Completed Past Booking (Eligible for review & earnings breakdown)
  {
    id: 'book-cmp-004',
    car_id: 'v-mb-a-class',
    vehicleId: 'v-mb-a-class',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    start_date: '2026-09-15',
    pickup: '2026-09-15',
    end_date: '2026-09-18',
    returnDate: '2026-09-18',
    total_price: 450,
    totalAmount: 450,
    status: 'completed',
    payment_status: 'paid',
    customer: 'Zubair Khan',
    renter_name: 'Zubair Khan',
    renter_phone: '+92 345 6667788',
    renter_email: 'zubair@gmail.com',
    host_name: 'Ali Motors',
    host_phone: '+92 321 9876543',
    car_title: 'Mercedes-Benz A-Class',
    car_image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    pickup_address: 'Mall of Lahore, Cantt, Lahore',
    pickup_time: '02:00 PM',
    return_time: '02:00 PM',
    review_rating: 5,
    review_comment: 'Immaculate vehicle and prompt contactless handover!',
  },
  // 5. Cancelled Booking (Refund Tracking)
  {
    id: 'book-cnc-005',
    car_id: 'v-audi-a4',
    vehicleId: 'v-audi-a4',
    renter_id: 'usr-renter-demo',
    host_id: 'owner-ali',
    start_date: '2026-09-01',
    pickup: '2026-09-01',
    end_date: '2026-09-03',
    returnDate: '2026-09-03',
    total_price: 220,
    totalAmount: 220,
    status: 'cancelled',
    payment_status: 'refunded',
    customer: 'Hamza Tariq',
    renter_name: 'Hamza Tariq',
    renter_phone: '+92 300 9991122',
    renter_email: 'hamza.t@hotmail.com',
    host_name: 'Ali Motors',
    host_phone: '+92 321 9876543',
    car_title: 'Audi A4 S-Line Quattro',
    car_image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    pickup_address: 'Blue Area Executive Parking, Islamabad',
    cancellation_reason: 'Renter flight reschedule - 100% refund processed',
    refund_status: 'Full Refund Completed to Original Card ($220.00)',
  },
];

let memoryBookings = seedBookings.map((b) => ({ ...b, createdAt: new Date().toISOString() }));

const seedIfEmpty = async () => {
  if (mongoose.connection.readyState !== 1) return false;
  try {
    const count = await Booking.countDocuments();
    if (count === 0) {
      await Booking.insertMany(seedBookings);
      console.log(`🌱  Seeded ${seedBookings.length} status-segmented bookings into MongoDB`);
    }
    return true;
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------
 * DAO
 * ------------------------------------------------------------------ */
const BookingModel = {
  findAll: async (filter = {}) => {
    const dbReady = await seedIfEmpty();
    if (dbReady) {
      try {
        const query = {};
        if (filter.vehicleId) query.vehicleId = filter.vehicleId;
        if (filter.car_id) query.car_id = filter.car_id;
        if (filter.status) query.status = filter.status;
        if (filter.host_id) query.host_id = filter.host_id;
        if (filter.renter_id) query.renter_id = filter.renter_id;
        return await Booking.find(query).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    return memoryBookings.filter((b) => {
      if (filter.vehicleId && b.vehicleId !== filter.vehicleId) return false;
      if (filter.car_id && b.car_id !== filter.car_id) return false;
      if (filter.status && b.status !== filter.status) return false;
      if (filter.host_id && b.host_id !== filter.host_id) return false;
      if (filter.renter_id && b.renter_id !== filter.renter_id) return false;
      return true;
    });
  },

  findById: async (id) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Booking.findOne({ id }).lean();
      } catch {}
    }
    return memoryBookings.find((b) => b.id === id) || null;
  },

  findActiveByVehicleId: async (vehicleId) => {
    const dbReady = await seedIfEmpty();
    if (dbReady) {
      try {
        return await Booking.findOne({
          $or: [{ vehicleId }, { car_id: vehicleId }],
          status: { $in: ['active', 'confirmed', 'pending'] },
        }).lean();
      } catch {}
    }
    return (
      memoryBookings.find(
        (b) =>
          (b.vehicleId === vehicleId || b.car_id === vehicleId) &&
          ['active', 'confirmed', 'pending'].includes(b.status)
      ) || null
    );
  },

  findByHost: async (hostId, statusFilter) => {
    const dbReady = await seedIfEmpty();
    if (dbReady) {
      try {
        const query = { host_id: hostId };
        if (statusFilter && statusFilter !== 'all') {
          query.status = statusFilter;
        }
        return await Booking.find(query).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    return memoryBookings.filter(
      (b) => b.host_id === hostId && (!statusFilter || statusFilter === 'all' || b.status === statusFilter)
    );
  },

  findByRenter: async (renterId, statusFilter) => {
    const dbReady = await seedIfEmpty();
    if (dbReady) {
      try {
        const query = { renter_id: renterId };
        if (statusFilter && statusFilter !== 'all') {
          query.status = statusFilter;
        }
        return await Booking.find(query).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    return memoryBookings.filter(
      (b) => b.renter_id === renterId && (!statusFilter || statusFilter === 'all' || b.status === statusFilter)
    );
  },

  create: async (bookingData) => {
    const id = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      id,
      car_id: bookingData.car_id || bookingData.vehicleId,
      vehicleId: bookingData.vehicleId || bookingData.car_id,
      start_date: bookingData.start_date || bookingData.pickup,
      pickup: bookingData.pickup || bookingData.start_date,
      end_date: bookingData.end_date || bookingData.returnDate,
      returnDate: bookingData.returnDate || bookingData.end_date,
      total_price: bookingData.total_price || bookingData.totalAmount || 0,
      totalAmount: bookingData.totalAmount || bookingData.total_price || 0,
      status: bookingData.status || 'pending',
      payment_status: bookingData.payment_status || 'paid',
      customer: bookingData.customer || bookingData.renter_name || 'Renter User',
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    if (mongoose.connection.readyState === 1) {
      try {
        const newBooking = new Booking(payload);
        return (await newBooking.save()).toObject();
      } catch {}
    }
    memoryBookings = [payload, ...memoryBookings];
    return payload;
  },

  update: async (id, updateData) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Booking.findOneAndUpdate(
          { id },
          { ...updateData, updatedAt: new Date() },
          { new: true }
        ).lean();
      } catch {}
    }
    let updated = null;
    memoryBookings = memoryBookings.map((b) => {
      if (b.id === id) {
        updated = { ...b, ...updateData, updatedAt: new Date().toISOString() };
        return updated;
      }
      return b;
    });
    return updated;
  },

  delete: async (id) => {
    if (mongoose.connection.readyState === 1) {
      try {
        const result = await Booking.deleteOne({ id });
        return result.deletedCount > 0;
      } catch {}
    }
    const before = memoryBookings.length;
    memoryBookings = memoryBookings.filter((b) => b.id !== id);
    return memoryBookings.length < before;
  },
};

module.exports = BookingModel;
