const VehicleService = require('../services/vehicle.service');

const VehicleController = {
  getVehicles: async (req, res, next) => {
    try {
      const vehicles = await VehicleService.getAllVehicles();
      res.json({
        success: true,
        data: vehicles,
        count: vehicles.length,
      });
    } catch (err) {
      next(err);
    }
  },

  getVehicleByIdOrSlug: async (req, res, next) => {
    try {
      const { id } = req.params;
      let vehicle = await VehicleService.getVehicleById(id);
      if (!vehicle) {
        // Also allow searching by slug
        vehicle = await VehicleService.getVehicleBySlug(id);
      }

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      res.json({
        success: true,
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  },

  getVehicleStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const statusData = await VehicleService.getVehicleStatus(id);

      if (!statusData) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      res.json({
        success: true,
        data: statusData,
      });
    } catch (err) {
      next(err);
    }
  },

  createVehicle: async (req, res, next) => {
    try {
      const { brand, model, location, pricePerDay } = req.body;
      if (!brand || !model || !location || !pricePerDay) {
        return res.status(400).json({
          success: false,
          message: 'Brand, model, location, and pricePerDay are required',
        });
      }

      const slug = req.body.slug || `${brand}-${model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const vehicle = await VehicleService.createVehicle({
        ...req.body,
        slug,
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle listed successfully',
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = VehicleController;
