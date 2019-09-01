'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('submission_file', {
      submission_file_id: {
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
      file_type_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'file_type',
          key: 'file_type_id',
        }
      },
      file_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'SET NULL',
        references: {
          model: 'file',
          key: 'file_id',
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('submission_file');
  }
};