'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('credentials', [
      { first_name_ru: 'Ипатий', last_name_ru: 'Янушкевич', middle_name_ru: 'Никифорович' },
      { first_name_ru: 'Кондратий', last_name_ru: 'Березин', middle_name_ru: 'Дмитриевич' },
      { first_name_ru: 'Игнат', last_name_ru: 'Остапюк', middle_name_ru:'Моисеевич'  },
      { first_name_ru: 'Арина', last_name_ru: 'Карамышева', middle_name_ru: 'Радиславовна' },
      { first_name_ru: 'Раиса', last_name_ru: 'Кимаск', middle_name_ru: 'Сигизмундовна' },
      { first_name_ru: 'Супер', last_name_ru: 'Юзер' },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('credentials', null, {});
  }
};
