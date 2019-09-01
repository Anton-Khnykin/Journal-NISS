'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('academic_degree', {
      academic_degree_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT
      },
      name_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name_en: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('academic_degree');
  }
};