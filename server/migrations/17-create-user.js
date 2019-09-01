'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user', {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      google_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      facebook_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      salt: {
        type: Sequelize.STRING(29),
        allowNull: true
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user');
  }
};