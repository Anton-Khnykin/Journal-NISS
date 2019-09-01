'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('issue_status', [
      { issue_status: 'Выпуск создан' },
      { issue_status: 'На рассмотрении редакционной коллегией' },
      { issue_status: 'Не одобрено редакционной коллегией' },
      { issue_status: 'Одобрено редакционной коллегией' },
      { issue_status: 'На рассмотрении главным редактором' },
      { issue_status: 'Отклонено главным редактором' },
      { issue_status: 'Принято главным редактором' },
      { issue_status: 'Отправлено в разработку' },
      { issue_status: 'Опубликовано' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('issue_status', null, {});
  }
};
