const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Profile model captures candidate information per requirements
// - skills: array of strings
// - projects: array of { title, description, links, skills[] }
// - work: optional array of roles/companies or free text
// - links: { github, linkedin, portfolio }
const Profile = sequelize.define(
	'Profile',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING, allowNull: false },
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: { isEmail: true },
		},
		education: { type: DataTypes.TEXT, allowNull: true },
		skills: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
		projects: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
		work: { type: DataTypes.JSON, allowNull: true },
		links: { type: DataTypes.JSON, allowNull: true },
	},
	{ timestamps: true }
);

module.exports = Profile;