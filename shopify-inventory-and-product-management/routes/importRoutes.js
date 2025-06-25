const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // @todo explor
const { importController } = require('../controllers/importController');

const router = express.Router();

// Route to handle import of inventory data
router.post('/upload', upload.single('file'), importController.uploadAndSync);

module.exports = router;