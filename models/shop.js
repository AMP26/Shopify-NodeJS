const sequelize = require("../config/dbconfig");
const { DataTypes } = require("sequelize");

const Shop = sequelize.define("Shop", {
  id: {
    type: DataTypes.STRING, // a string type to match Shopify domain
    primaryKey: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  currency: { type: DataTypes.STRING }
},
  { timestamps: true }
);

module.exports = Shop;