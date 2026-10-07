const VehicleModel = require('../models/vehicle.model');
const BookingModel = require('../models/booking.model');

const VehicleService = {
  /**
   * Get all vehicles with their computed live booking status
   */
  getAllVehicles: async () => {
    const vehicles = await VehicleModel.findAll();
    const enriched = await Promise.all(
      vehicles.map(async (vehicle) => {
        const activeBooking = await BookingModel.findActiveByVehicleId(vehicle.id);
        const isBooked = !!activeBooking;
        return {
          ...vehicle,
          status: isBooked ? 'booked' : 'available',
          bookable: !isBooked,
          currentBooking: activeBooking
            ? {
                id: activeBooking.id,
                customer: activeBooking.customer,
                pickup: activeBooking.pickup,
                returnDate: activeBooking.returnDate,
                status: activeBooking.status,
              }
            : null,
        };
      })
    );
    return enriched;
  },

  /**
   * Get single vehicle by ID with booking status
   */
  getVehicleById: async (id) => {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) return null;

    const activeBooking = await BookingModel.findActiveByVehicleId(vehicle.id);
    const isBooked = !!activeBooking;
    return {
      ...vehicle,
      status: isBooked ? 'booked' : 'available',
      bookable: !isBooked,
      currentBooking: activeBooking
        ? {
            id: activeBooking.id,
            customer: activeBooking.customer,
            pickup: activeBooking.pickup,
            returnDate: activeBooking.returnDate,
            status: activeBooking.status,
          }
        : null,
    };
  },

  /**
   * Get single vehicle by Slug with booking status
   */
  getVehicleBySlug: async (slug) => {
    const vehicle = await VehicleModel.findBySlug(slug);
    if (!vehicle) return null;

    const activeBooking = await BookingModel.findActiveByVehicleId(vehicle.id);
    const isBooked = !!activeBooking;
    return {
      ...vehicle,
      status: isBooked ? 'booked' : 'available',
      bookable: !isBooked,
      currentBooking: activeBooking
        ? {
            id: activeBooking.id,
            customer: activeBooking.customer,
            pickup: activeBooking.pickup,
            returnDate: activeBooking.returnDate,
            status: activeBooking.status,
          }
        : null,
    };
  },

  /**
   * Lightweight vehicle booking status check
   */
  getVehicleStatus: async (id) => {
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) return null;

    const activeBooking = await BookingModel.findActiveByVehicleId(vehicle.id);
    const isBooked = !!activeBooking;
    return {
      vehicleId: vehicle.id,
      status: isBooked ? 'booked' : 'available',
      bookable: !isBooked,
      currentBooking: activeBooking
        ? {
            id: activeBooking.id,
            customer: activeBooking.customer,
            pickup: activeBooking.pickup,
            returnDate: activeBooking.returnDate,
            status: activeBooking.status,
          }
        : null,
    };
  },
};

module.exports = VehicleService;
