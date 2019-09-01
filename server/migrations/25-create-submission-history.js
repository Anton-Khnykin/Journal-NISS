'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('submission_history', {
      submission_history_id: {
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
        },
      },
      submission_status_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'NO ACTION',
        references: {
          model: 'submission_status',
          key: 'submission_status_id',
        },
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'SET NULL',
        references: {
          model: 'review',
          key: 'review_id',
        },
      },
      deadline_author: {
        type: Sequelize.DATE,
        allowNull: true
      },
      commentary: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('submission_history');
  }
};