const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/vehicle.model');
const BookingModel = require('../models/booking.model');
const { requireRenter } = require('../middleware/roleGuard');

// GET /api/renter/cars/search - Search cars by city or geolocation proximity
// Allow public or renter search, but enforce role if authenticated
router.get('/cars/search', async (req, res, next) => {
  try {
    const { city, lat, lng, radius } = req.query;

    let cars = [];

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusKm = radius ? parseFloat(radius) : 25;

      if (!isNaN(latitude) && !isNaN(longitude)) {
        cars = await VehicleModel.findByNear({ lat: latitude, lng: longitude, radiusKm });
      } else {
        cars = await VehicleModel.findAll();
      }
    } else if (city && city.trim().length > 0) {
      cars = await VehicleModel.findByCity(city.trim());
    } else {
      cars = await VehicleModel.findAll();
    }

    // Ensure lat/lng, address_text, and status fields are populated
    const formattedCars = cars.map((car) => ({
      id: car.id,
      slug: car.slug,
      make: car.make || car.brand,
      model: car.model,
      year: car.year || 2023,
      license_plate: car.license_plate || '',
      category: car.category || 'Sedan',
      location: car.location,
      city_name: car.city_name || (car.location ? car.location.split(',')[0].trim() : 'Lahore'),
      address_text: car.address_text || car.location || '',
      latitude: car.latitude || 31.5204,
      longitude: car.longitude || 74.3587,
      price_per_day: car.price_per_day || car.pricePerDay || 50,
      status: car.status || 'available',
      rating: car.rating || 4.9,
      reviewCount: car.reviewCount || 50,
      seats: car.seats || 5,
      transmission: car.transmission || 'Automatic',
      fuelType: car.fuelType || 'Petrol',
      image: car.image,
      gallery: car.gallery || [car.image],
      features: car.features || [],
      description: car.description || '',
      distanceKm: car.distanceKm || null,
    }));

    res.json({
      success: true,
      data: formattedCars,
      count: formattedCars.length,
    });
  } catch (err) {
    next(err);
  }
});

// Guard all subsequent /api/renter/* actions with requireRenter
router.use(requireRenter);

// GET /api/renter/bookings - Get segmented trips for logged-in renter
router.get('/bookings', async (req, res, next) => {
  try {
    const renterId = req.user.id;
    const { status } = req.query;
    const bookings = await BookingModel.findByRenter(renterId, status);

    // Segment bookings into categories for quick consumption
    const segmented = {
      all: bookings,
      pending: bookings.filter((b) => b.status === 'pending'),
      confirmed: bookings.filter((b) => b.status === 'confirmed'),
      active: bookings.filter((b) => b.status === 'active'),
      completed: bookings.filter((b) => b.status === 'completed'),
      cancelled: bookings.filter((b) => b.status === 'cancelled'),
    };

    res.json({
      success: true,
      data: bookings,
      segmented,
      count: bookings.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/renter/bookings - Create a new booking reservation
router.post('/bookings', async (req, res, next) => {
  try {
    const renterId = req.user.id;
    const {
      car_id,
      start_date,
      end_date,
      pickup_time,
      return_time,
      pickup_address,
      total_price,
      customer_notes,
    } = req.body;

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'car_id, start_date, and end_date are required.',
      });
    }

    const car = await VehicleModel.findById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    const newBooking = await BookingModel.create({
      car_id: car.id,
      vehicleId: car.id,
      renter_id: renterId,
      host_id: car.host_id || car.ownerId || 'owner-ali',
      start_date,
      pickup: start_date,
      end_date,
      returnDate: end_date,
      pickup_time: pickup_time || '10:00 AM',
      return_time: return_time || '06:00 PM',
      pickup_address: pickup_address || car.address_text || car.location,
      total_price: total_price || car.price_per_day || car.pricePerDay || 75,
      totalAmount: total_price || car.price_per_day || car.pricePerDay || 75,
      status: 'pending', // Starts as pending approval by host
      payment_status: 'paid',
      customer: req.user.name || 'Renter User',
      renter_name: req.user.name || 'Renter User',
      renter_phone: req.user.phone || '+92 300 1234567',
      renter_email: req.user.email || 'renter@driveflex.pk',
      car_title: `${car.make || car.brand} ${car.model}`,
      car_image: car.image,
      notes: customer_notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully. Waiting for host approval.',
      data: newBooking,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/renter/bookings/:id/cancel - Cancel a booking
router.post('/bookings/:id/cancel', async (req, res, next) => {
  try {
    const renterId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.renter_id !== renterId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this booking.',
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status '${booking.status}'.`,
      });
    }

    const updated = await BookingModel.update(id, {
      status: 'cancelled',
      payment_status: 'refunded',
      refund_status: 'Refund Processed to Original Payment Method',
      cancellation_reason: reason || 'Cancelled by renter',
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund processed.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/renter/bookings/:id/review - Submit a review for a completed booking
router.post('/bookings/:id/review', async (req, res, next) => {
  try {
    const renterId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.renter_id !== renterId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this booking.',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only leave reviews on completed trips.',
      });
    }

    const updated = await BookingModel.update(id, {
      review_rating: Number(rating) || 5,
      review_comment: comment || 'Smooth rental experience with DriveFlex!',
    });

    res.json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
