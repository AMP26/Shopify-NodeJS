const sequelize = require("../config/dbconfig");
const { DataTypes } = require("sequelize");
const Shop = require("./shop");

const Product = sequelize.define("Product", {
  gid: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: { type: DataTypes.TEXT },
  shopId: {
    type: DataTypes.STRING,
    references: {
      model: Shop,
      key: "id"
    }
  }
},
  { timestamps: true }
);

module.exports = Product;