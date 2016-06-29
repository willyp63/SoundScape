const dispatcher = require('../dispatcher');

module.exports = {
  setErrors (errors) {
    dispatcher.dispatch({
      actionType: "RECEIVE_ERRORS",
      errors: errors
    });
  },
  removeErrors () {
    dispatcher.dispatch({
      actionType: "REMOVE_ERRORS"
    });
  }
};
