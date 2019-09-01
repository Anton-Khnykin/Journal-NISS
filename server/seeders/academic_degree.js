'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('academic_degree', [
      { name_ru: 'Кандидат архитектуры', name_en: 'Candidate of Architecture'},
      { name_ru: 'Кандидат биологических наук', name_en: 'Candidate of Biological Sciences'},
      { name_ru: 'Кандидат ветеринарных наук', name_en: 'Candidate of Veterinary Sciences'},
      { name_ru: 'Кандидат военных наук', name_en: 'Candidate of Military Sciences'},
      { name_ru: 'Кандидат географических наук', name_en: 'Candidate of Geographic Sciences'},
      { name_ru: 'Кандидат геолого-минералогических наук', name_en: 'Candidate of Geologo-Mineralogical Sciences'},
      { name_ru: 'Кандидат искусствоведения', name_en: 'Candidate of Art Criticism'},
      { name_ru: 'Кандидат исторических наук', name_en: 'Candidate of Historical Sciences'},
      { name_ru: 'Кандидат культурологии', name_en: 'Candidate of Culturology'},
      { name_ru: 'Кандидат медицинских наук', name_en: 'Candidate of Medical Sciences'},
      { name_ru: 'Кандидат педагогических наук', name_en: 'Candidate of Pedagogic Sciences'},
      { name_ru: 'Кандидат политических наук', name_en: 'Candidate of Political Sciences'},
      { name_ru: 'Кандидат психологических наук', name_en: 'Candidate of Psychological Sciences'},
      { name_ru: 'Кандидат сельскохозяйственных наук', name_en: 'Candidate of Agricultural Sciences'},
      { name_ru: 'Кандидат социологических наук', name_en: 'Candidate of Sociological Sciences'},
      { name_ru: 'Кандидат теологических наук', name_en: 'Candidate of Theological Sciences'},
      { name_ru: 'Кандидат технических наук', name_en: 'Candidate of Engineering Sciences'},
      { name_ru: 'Кандидат фармацевтических наук', name_en: 'Candidate of Pharmaceutical Sciences'},
      { name_ru: 'Кандидат физико-математических наук', name_en: 'Candidate of Physico-mathematical Sciences'},
      { name_ru: 'Кандидат филологических наук', name_en: 'Candidate of Philological Sciences '},
      { name_ru: 'Кандидат философских наук', name_en: 'Candidate of Philosophical Sciences'},
      { name_ru: 'Кандидат химических наук', name_en: 'Candidate of Chemical Sciences '},
      { name_ru: 'Кандидат экономических наук', name_en: 'Candidate of Economic Sciences'},
      { name_ru: 'Кандидат юридических наук', name_en: 'Candidate of Juridical Sciences '},
      { name_ru: 'Доктор архитектуры', name_en: 'Doctor of Architecture'},
      { name_ru: 'Доктор биологических наук', name_en: 'Doctor of Biological Sciences'},
      { name_ru: 'Доктор ветеринарных наук', name_en: 'Doctor of Veterinary Sciences'},
      { name_ru: 'Доктор военных наук', name_en: 'Doctor of Military Sciences'},
      { name_ru: 'Доктор географических наук', name_en: 'Doctor of Geographic Sciences'},
      { name_ru: 'Доктор геолого-минералогических наук', name_en: 'Doctor of Geologo-Mineralogical Sciences'},
      { name_ru: 'Доктор искусствоведения', name_en: 'Doctor of Art Criticism'},
      { name_ru: 'Доктор исторических наук', name_en: 'Doctor of Historical Sciences'},
      { name_ru: 'Доктор культурологии', name_en: 'Doctor of Culturology'},
      { name_ru: 'Доктор медицинских наук', name_en: 'Doctor of Medical Sciences'},
      { name_ru: 'Доктор педагогических наук', name_en: 'Doctor of Pedagogic Sciences'},
      { name_ru: 'Доктор политических наук', name_en: 'Doctor of Political Sciences'},
      { name_ru: 'Доктор психологических наук', name_en: 'Doctor of Psychological Sciences'},
      { name_ru: 'Доктор сельскохозяйственных наук', name_en: 'Doctor of Agricultural Sciences'},
      { name_ru: 'Доктор социологических наук', name_en: 'Doctor of Sociological Sciences'},
      { name_ru: 'Доктор теологических наук', name_en: 'Doctor of Theological Sciences'},
      { name_ru: 'Доктор технических наук', name_en: 'Doctor of Engineering Sciences'},
      { name_ru: 'Доктор фармацевтических наук', name_en: 'Doctor of Pharmaceutical Sciences'},
      { name_ru: 'Доктор физико-математических наук', name_en: 'Doctor of Physico-mathematical Sciences'},
      { name_ru: 'Доктор филологических наук', name_en: 'Doctor of Philological Sciences '},
      { name_ru: 'Доктор философских наук', name_en: 'Doctor of Philosophical Sciences'},
      { name_ru: 'Доктор химических наук', name_en: 'Doctor of Chemical Sciences '},
      { name_ru: 'Доктор экономических наук', name_en: 'Doctor of Economic Sciences'},
      { name_ru: 'Доктор юридических наук', name_en: 'Doctor of Juridical Sciences' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('academic_degree', null, {});
  }
};
