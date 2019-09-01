module.exports = {
  "development": {
    "username": process.env.DEV_BD_USERNAME,
    "password": process.env.DEV_DB_PASS,
    "database": process.env.DEV_DB_NAME,
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "migrationStorageTableName": "sequelize_meta"
  },
  "production": {
    "username": process.env.PRODUCTION_USERNAME,
    "password": process.env.PRODUCTION_PASSWORD,
    "database": process.env.PRODUCTION_DATABASE,
    "host": process.env.PRODUCTION_HOST,
    "port": process.env.PRODUCTION_PORT,
    "dialect": "postgres",
    "migrationStorageTableName": "sequelize_meta",
    "dialectOptions": {
      "ssl": true
    }
  }
}
