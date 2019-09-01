'use strict';

const query = "CREATE TRIGGER on_is_accepted_update " + 
                "AFTER UPDATE OF is_accepted " + 
                "ON public.issue_decision " + 
                "FOR EACH ROW " + 
                "EXECUTE PROCEDURE public.handle_editorial_board_decision();"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(query)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(query) 
  }
};