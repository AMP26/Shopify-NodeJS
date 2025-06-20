const express = require("express");
const sequelize = require('./config/dbconfig');
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

// Route
app.use("/auth", authRoutes); // shopify oauth flow and store shop details


sequelize.sync({ alter: true }).then(() => { app.listen(3000, () => { console.log(`Server is running on port ${3000}`); }); });