'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('author_submission', {
      author_submission_id: {
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
        }
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
      author_position_in_credits: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      is_primary_contact: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('author_submission');
  }
};