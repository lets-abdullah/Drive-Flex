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
        const isDelisted = Boolean(vehicle.isDelisted || vehicle.status === 'maintenance');
        return {
          ...vehicle,
          isDelisted,
          status: isDelisted ? 'maintenance' : isBooked ? 'booked' : 'available',
          bookable: !isBooked && !isDelisted,
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
    const isDelisted = Boolean(vehicle.isDelisted || vehicle.status === 'maintenance');
    return {
      ...vehicle,
      isDelisted,
      status: isDelisted ? 'maintenance' : isBooked ? 'booked' : 'available',
      bookable: !isBooked && !isDelisted,
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
    const isDelisted = Boolean(vehicle.isDelisted || vehicle.status === 'maintenance');
    return {
      ...vehicle,
      isDelisted,
      status: isDelisted ? 'maintenance' : isBooked ? 'booked' : 'available',
      bookable: !isBooked && !isDelisted,
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
    const isDelisted = Boolean(vehicle.isDelisted || vehicle.status === 'maintenance');
    return {
      vehicleId: vehicle.id,
      isDelisted,
      status: isDelisted ? 'maintenance' : isBooked ? 'booked' : 'available',
      bookable: !isBooked && !isDelisted,
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
   * Create a new vehicle in database
   */
  createVehicle: async (data) => {
    return VehicleModel.create(data);
  },

  /**
   * Update an existing vehicle
   */
  updateVehicle: async (id, data) => {
    return VehicleModel.update(id, data);
  },

  /**
   * Permanently delete a vehicle
   */
  deleteVehicle: async (id) => {
    return VehicleModel.delete(id);
  },
};

module.exports = VehicleService;
