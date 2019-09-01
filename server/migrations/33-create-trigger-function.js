'use strict';

const query = "CREATE FUNCTION public.handle_editorial_board_decision() " + 
                "RETURNS trigger " +
                "LANGUAGE 'plpgsql' " +
                "COST 100 " +
                "VOLATILE NOT LEAKPROOF " +
              "AS $BODY$BEGIN " +
                "IF ((select count(is_accepted) from issue_decision where is_accepted is not null and issue_id = NEW.issue_id) = " +
                    "(select count(*) from issue_decision where issue_id = NEW.issue_id)) " +
                    "THEN " +
                      "IF ((select count(is_accepted) from issue_decision where is_accepted is TRUE and issue_id = NEW.issue_id) >= " +
                          "(select count(is_accepted) from issue_decision where is_accepted is FALSE and issue_id = NEW.issue_id)) " +
                          "THEN " +
                            "update issue set issue_status_id = 4 where issue_id = NEW.issue_id; " +
                          "ELSE " +
                            "update issue set issue_status_id = 3 where issue_id = NEW.issue_id; " +
                      "END IF; " +
                "END IF; " +
                "RETURN NEW; " +
              "END;$BODY$;"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(query)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(query) 
  }
};