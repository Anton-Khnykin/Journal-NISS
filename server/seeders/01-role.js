'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('role', [
      { role_name: 'Администратор' },
      { role_name: 'Автор' },
      { role_name: 'Ответственный секретарь' },
      { role_name: 'Главный редактор' },
      { role_name: 'Рецензент' },
      { role_name: 'Член редакционной коллегии' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role', null, {});
  }
};
