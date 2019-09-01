'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('recommendation', [
      { recommendation: 'Принять' },
      { recommendation: 'Отклонить' },
      { recommendation: 'Отправить на доработку без повторного рецензирования' },
      { recommendation: 'Отправить на доработку с повторным рецензированием' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('recommendation', null, {});
  }
};
