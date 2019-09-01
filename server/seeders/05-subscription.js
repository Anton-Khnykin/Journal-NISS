'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('subscription', [
      { name: 'Новый выпуск журнала' },
      { name: 'Новый статус заявки' },
      { name: 'Новое сообщение' },
      { name: 'Новый статус выпуска' },
      { name: 'Новая заявка' },
      { name: 'Новый статус рецензии' },
      { name: 'Новая заявка на рецензию' },
      { name: 'Новый выпуск на рассмотрение' },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('subscription', null, {});
  }
};