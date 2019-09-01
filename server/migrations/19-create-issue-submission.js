'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('issue_submission', {
      issue_submission_id: {
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
      submission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'submission',
          key: 'submission_id',
        }
      },
      file_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'NO ACTION',
        references: {
          model: 'file',
          key: 'file_id',
        }
      },
      pages: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submission_search: {
        type: 'tsvector',
        allowNull: true
      }
    })
      .then(() => queryInterface.addIndex(
        'issue_submission', 
        ['submission_search'],
        {
          name: 'submission_search_idx',
          using: 'gin'
        }
      ));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('issue_submission');
  }
};