'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('academic_title', [
      { name_ru: 'Доцент', name_en: 'Docent'},
      { name_ru: 'Профессор', name_en: 'Full Professor'}
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('academic_title', null, {});
  }
};
