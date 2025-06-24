const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("publicshopifyapp", "root", "Amitpats#11", {
  host: "localhost",
  dialect: "mysql",
  logging: false
});

// Testing database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connection established!.'))
  .catch((err) => console.error('Failed to connect to the database:', err));

module.exports = sequelize;