'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env] || config.development;

async function main() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || dbConfig.database,
    process.env.DB_USER || dbConfig.username,
    process.env.DB_PASSWORD || dbConfig.password,
    {
      host: process.env.DB_HOST || dbConfig.host,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: dbConfig.dialect || 'postgres',
      logging: false,
    }
  );

  const queryInterface = sequelize.getQueryInterface();
  await sequelize.query(
    'CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name VARCHAR(255) NOT NULL PRIMARY KEY)'
  );

  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    const [done] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" WHERE name = :name',
      { replacements: { name: file } }
    );
    if (done.length > 0) {
      console.log(file + ': already migrated');
      continue;
    }
    const migration = require(path.join(dir, file));
    await migration.up(queryInterface, Sequelize);
    await sequelize.query('INSERT INTO "SequelizeMeta" (name) VALUES (:name)', {
      replacements: { name: file },
    });
    console.log(file + ': migrated');
  }

  await sequelize.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
