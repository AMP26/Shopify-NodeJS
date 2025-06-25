const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

// Define Variant model
const Variant = sequelize.define("Variant", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  inventory_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  old_inventory_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isUpdated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  productId: {
    type: DataTypes.STRING,
    references: {
      model: "Products",
      key: "gid"
    },
    onDelete: "CASCADE"
  }
});

module.exports = Variant;