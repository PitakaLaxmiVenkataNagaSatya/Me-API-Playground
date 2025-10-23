const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Use environment variables when provided, else default to a local SQLite DB to simplify setup
const DIALECT = process.env.DB_DIALECT || 'sqlite';
const STORAGE = process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'database.sqlite');

let sequelize;

if (DIALECT === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'me_api_playground',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      dialect: 'mysql',
      logging: false,
    }
  );
} else if (DIALECT === 'postgres') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined,
    },
  });
} else {
  // Default: SQLite (no external service required)
  // Ensure directory exists
  try {
    fs.mkdirSync(path.dirname(STORAGE), { recursive: true });
  } catch (_) {}

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: STORAGE,
    logging: false,
  });
}

module.exports = sequelize;
