'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('review_status', [
      { review_status: 'Ожидается решение рецензента' },
      { review_status: 'Заявка принята' },
      { review_status: 'Заявка отклонена' },
      { review_status: 'Готова' },
      { review_status: 'Отправлена автору' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('review_status', null, {});
  }
};
