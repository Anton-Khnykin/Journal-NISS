'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('file_type', [
      { file_type_name: 'Текст статьи' },
      { file_type_name: 'Заключение о возможности открытого публикования' },
      { file_type_name: 'Идентификационное заключение' },
      { file_type_name: 'Экспертное заключение' },
      { file_type_name: 'Приложения' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('file_type', null, {});
  }
};
