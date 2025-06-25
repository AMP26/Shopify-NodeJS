const express = require('express');
const { exportController } = require('../controllers/exportController');

const router = express.Router();

// Route to handle exporting data to an Excel file
router.get('/', exportController.exportInventory);

module.exports = router;