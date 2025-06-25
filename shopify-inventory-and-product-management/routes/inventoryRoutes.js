const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// Handle inventory update
router.put('/update', inventoryController.updateInventory);

module.exports = router;