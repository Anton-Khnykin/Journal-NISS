'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_subscription', {
      user_subscription_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'user',
          key: 'user_id',
        },
      },
      subscription_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'subscription',
          key: 'subscription_id',
        },
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_subscription');
  }
};