const dispatcher = require('../dispatcher');

module.exports = {
  setErrors (form, errors) {
    dispatcher.dispatch({
      actionType: "RECEIVE_ERRORS",
      form: form,
      errors: errors
    });
  },
  removeErrors () {
    dispatcher.dispatch({
      actionType: "REMOVE_ERRORS"
    });
  }
};
