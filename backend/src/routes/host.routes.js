const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/vehicle.model');
const BookingModel = require('../models/booking.model');
const { requireHost } = require('../middleware/roleGuard');

// Enforce strict host role across all /api/host/* endpoints
router.use(requireHost);

// GET /api/host/vehicles - List all vehicles belonging to the logged-in host
router.get('/vehicles', async (req, res, next) => {
  try {
    const hostId = req.user.id;
    const vehicles = await VehicleModel.findByHost(hostId);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/host/vehicles - List a new car with precise coordinates
router.post('/vehicles', async (req, res, next) => {
  try {
    const hostId = req.user.id;
    const {
      make,
      model,
      year,
      license_plate,
      price_per_day,
      category,
      city_name,
      address_text,
      latitude,
      longitude,
      image,
      gallery,
      features,
    } = req.body;

    if (!make || !model || !price_per_day || !city_name) {
      return res.status(400).json({
        success: false,
        message: 'Make, model, price_per_day, and city_name are required.',
      });
    }

    const brand = make;
    const slug = `${make}-${model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCar = await VehicleModel.create({
      make,
      brand,
      model,
      year: year ? parseInt(year, 10) : 2023,
      license_plate: license_plate || '',
      category: category || 'Sedan',
      location: `${city_name}, Pakistan`,
      city_name,
      address_text: address_text || `${city_name} Hub`,
      latitude: latitude ? parseFloat(latitude) : 31.5204,
      longitude: longitude ? parseFloat(longitude) : 74.3587,
      price_per_day: parseFloat(price_per_day),
      pricePerDay: parseFloat(price_per_day),
      status: 'available',
      host_id: hostId,
      ownerId: hostId,
      provider: req.user.businessName || req.user.name || 'Verified Host',
      image: image || 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
      gallery: gallery || [],
      features: features || ['Executive Cleaned', 'GPS Tracking'],
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle listed successfully in your fleet!',
      data: newCar,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/host/vehicles/:id/status - Update vehicle operational status
router.patch('/vehicles/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'available' | 'rented' | 'maintenance'

    if (!['available', 'rented', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'available', 'rented', or 'maintenance'",
      });
    }

    const updated = await VehicleModel.update(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({
      success: true,
      message: `Vehicle status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/host/bookings - Segmented bookings dashboard for host
router.get('/bookings', async (req, res, next) => {
  try {
    const hostId = req.user.id;
    const { status } = req.query;

    const allBookings = await BookingModel.findByHost(hostId, status);

    // Segment into distinct dashboard buckets
    const pending = allBookings.filter((b) => b.status === 'pending');
    const upcoming = allBookings.filter((b) => b.status === 'confirmed');
    const active = allBookings.filter((b) => b.status === 'active');
    const completed = allBookings.filter((b) => b.status === 'completed');
    const cancelled = allBookings.filter((b) => b.status === 'cancelled');

    const totalEarnings = completed.reduce((acc, curr) => acc + (curr.total_price || curr.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        pending,
        upcoming,
        active,
        completed,
        cancelled,
        analytics: {
          totalBookings: allBookings.length,
          totalEarnings,
          activeVehiclesOut: active.length,
          pendingRequestsCount: pending.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/host/bookings/:id/approve - Host manually approves pending booking
router.post('/bookings/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await BookingModel.update(id, { status: 'confirmed' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking request approved! Renter has been confirmed.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/host/bookings/:id/reject - Host declines booking request
router.post('/bookings/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Declined by host due to schedule unavailability' } = req.body;
    const updated = await BookingModel.update(id, {
      status: 'cancelled',
      payment_status: 'refunded',
      cancellation_reason: reason,
      refund_status: '100% Refund Queued to Renter',
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking request declined. Refund initiated.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
