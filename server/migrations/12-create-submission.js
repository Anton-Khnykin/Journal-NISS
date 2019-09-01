'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('submission', {
      submission_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submission_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      },
      title_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      abstract_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      abstract_en: {
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
      },
      submission_status_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'submission_status',
          key: 'submission_status_id',
        }
      },
      keywords_ru: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      keywords_en: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('submission');
  }
};