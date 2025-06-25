const express = require("express");
const productSyncController = require("../controllers/productSyncController");

const router = express.Router();

router.get("/sync", productSyncController.sync);

module.exports = router;