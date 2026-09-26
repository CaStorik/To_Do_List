const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env] || config.development;

const sequelize = new Sequelize(
  process.env.DB_NAME || dbConfig.database,
  process.env.DB_USER || dbConfig.username,
  process.env.DB_PASSWORD || dbConfig.password,
  {
    host: process.env.DB_HOST || dbConfig.host,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Task = require('./task')(sequelize);

module.exports = db;