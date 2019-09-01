'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('issue_decision', {
      issue_decision_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'issue',
          key: 'issue_id',
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'SET NULL',
        references: {
          model: 'user',
          key: 'user_id',
        }
      },
      is_accepted: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      commentary: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('issue_decision');
  }
};