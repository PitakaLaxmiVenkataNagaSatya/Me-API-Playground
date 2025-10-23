const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  work: {
    type: DataTypes.STRING,
    allowNull: true
  },
  github: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  portfolio: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Profile;
