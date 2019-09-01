'use strict';
const bcrypt = require('bcrypt');
const adminSalt = bcrypt.genSaltSync(12);
const superSalt = bcrypt.genSaltSync(12);

const secretarSalt = bcrypt.genSaltSync(12);
const reviewerSalt = bcrypt.genSaltSync(12);
const ebmSalt = bcrypt.genSaltSync(12);
const editorSalt = bcrypt.genSaltSync(12);

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user', [
      { email: 'admin@loo.ru', salt: adminSalt, password: bcrypt.hashSync('123', adminSalt), credentials_id: 1 },
      { email: 'secretary@loo.ru', salt: secretarSalt, password: bcrypt.hashSync('123', secretarSalt), credentials_id: 2 },
      { email: 'reviewer@loo.ru', salt: reviewerSalt, password: bcrypt.hashSync('123', reviewerSalt), credentials_id: 3 },
      { email: 'ebm@loo.ru', salt: ebmSalt, password: bcrypt.hashSync('123', ebmSalt), credentials_id: 4 },
      { email: 'editor@loo.ru', salt: editorSalt, password: bcrypt.hashSync('123', editorSalt), credentials_id: 5 },

      { email: 'super@loo.ru', salt: superSalt, password: bcrypt.hashSync('123', superSalt), credentials_id: 6 },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {});
  }
};
