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
};

module.exports = VehicleController;
