import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const db = {};
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname + '/../sequelize_config.js'))[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    const modelName = model.name.split('_').map(item => item[0].toUpperCase() + item.slice(1)).join('');
    db[modelName] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log('Соединение успешно установлено.');
  })
  .catch(err => {
    console.error('Не удалось подключиться к базе данных:', err);
  });

module.exports = db;
