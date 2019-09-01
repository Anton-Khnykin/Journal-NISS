'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('keyword', {
      keyword_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      word: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      language_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'language',
          key: 'language_id',
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('keyword');
  }
};