'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('review', {
      review_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'submission',
          key: 'submission_id',
        }
      },
      credentials_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'credentials',
          key: 'credentials_id',
        }
      },
      recommendation_id: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'recommendation',
          key: 'recommendation_id',
        }
      },
      deadline_reviewer: {
        type: Sequelize.DATE,
        allowNull: false
      },
      review_file_signed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'file',
          key: 'file_id',
        }
      },
      review_file: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'file',
          key: 'file_id',
        }
      },
      review_status_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'NO ACTION',
        references: {
          model: 'review_status',
          key: 'review_status_id',
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('review');
  }
};