'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('issue', {
      issue_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      volume_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'volume',
          key: 'volume_id',
        },
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      number_general: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      creation_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW')
      },
      publication_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      issue_status_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        onDelete: 'RESTRICT',
        references: {
          model: 'issue_status',
          key: 'issue_status_id',
        },
      },
      file_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'RESTRICT',
        references: {
          model: 'file',
          key: 'file_id',
        },
      },
      is_published_on_site: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      },
      cover: {
        type: Sequelize.BLOB,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('issue');
  }
};