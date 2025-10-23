/*
  Seed script: loads data from seeds/profile.json into the database (upsert by email)
*/
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db');
const Profile = require('../models/Profile');

async function main() {
  try {
    const file = path.join(__dirname, 'profile.json');
    const raw = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);

    await sequelize.sync();

    // Ensure only one profile exists (single-owner app)
    await Profile.destroy({ where: { email: { [require('sequelize').Op.ne]: data.email } } });

    const [profile, created] = await Profile.findOrCreate({
      where: { email: data.email },
      defaults: data,
    });

    if (!created) {
      await profile.update(data);
    }

    console.log(`${created ? 'Created' : 'Updated'} profile for`, data.email);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

main();
