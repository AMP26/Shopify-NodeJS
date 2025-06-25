const express = require("express");
const sequelize = require('./config/dbconfig');
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productSyncRoutes = require("./routes/productSyncRoutes");
const importRoutes = require("./routes/importRoutes");
const exportRoutes = require("./routes/exportRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes); // shopify oauth flow and
app.use("/products", productSyncRoutes); // product sync
app.use("/import", importRoutes); // upload Excel
app.use("/export", exportRoutes); // export data
app.use("/inventory", inventoryRoutes); // update inventory

sequelize.sync({ alter: true }).then(() => { app.listen(3000, () => { console.log(`Server is running on port ${3000}`); }); });