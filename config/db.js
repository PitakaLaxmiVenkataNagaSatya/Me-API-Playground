const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('me_api_playground', 'root', 'Kiddu@26', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
