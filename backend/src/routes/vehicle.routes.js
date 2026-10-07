const express = require('express');
const VehicleController = require('../controllers/vehicle.controller');

const router = express.Router();

// GET /api/vehicles - List all vehicles with availability status
router.get('/', VehicleController.getVehicles);

// GET /api/vehicles/:id/status - Lightweight availability status check
router.get('/:id/status', VehicleController.getVehicleStatus);

// GET /api/vehicles/:id - Single vehicle with live booking details
router.get('/:id', VehicleController.getVehicleByIdOrSlug);

module.exports = router;
