'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('submission_status', [
      { status: 'На рассмотрении' },
      { status: 'На рецензировании' },
      { status: 'На доработке' },
      { status: 'Рекомендовано к публикации' },
      { status: 'Принято в текущий номер' },
      { status: 'Опубликовано' },
      { status: 'Отклонено' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('submission_status', null, {});
  }
};
