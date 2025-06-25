const sequelize = require("../config/dbconfig");
const Shop = require("./shop");
const Product = require("./product");
const Variant = require("./variant");

// Relationships
Shop.hasMany(Product, { foreignKey: "shopId" });
Product.belongsTo(Shop, { foreignKey: "shopId" });

Product.hasMany(Variant, { foreignKey: "productId" });
Variant.belongsTo(Product, { foreignKey: "productId" });

module.exports = { Shop, Product, Variant, sequelize };