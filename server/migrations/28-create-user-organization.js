'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_organization', {
      user_organization_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      credentials_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'credentials',
          key: 'credentials_id',
        },
      },
      organization_name_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      organization_name_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      organization_address_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      organization_address_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      person_position_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      person_position_en: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_organization');
  }
};