'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('file', {
      file_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      file_data: {
        type: Sequelize.BLOB,
        allowNull: false
      },
      file_type: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file_name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('file');
  }
};