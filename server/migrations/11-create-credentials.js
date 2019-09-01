'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('credentials', {
      credentials_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      first_name_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      middle_name_ru: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      middle_name_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      last_name_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      last_name_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING(254),
        allowNull: true
      },
      country_id: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'country',
          key: 'country_id',
        }
      },
      academic_degree_id: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'academic_degree',
          key: 'academic_degree_id',
        },
      },
      academic_title_id: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'academic_title',
          key: 'academic_title_id',
        },
      },
      scientific_interests_ru: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scientific_interests_en: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('credentials');
  }
};