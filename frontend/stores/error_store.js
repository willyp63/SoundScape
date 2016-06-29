const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _errors;

const ErrorStore = new Store(dispatcher);

ErrorStore.errors = () => _errors;

ErrorStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_ERRORS":
      setErrors(payload.errors);
      this.__emitChange();
      break;
    case "REMOVE_ERRORS":
      _errors = undefined;
      this.__emitChange();
      break;
  }
};

function setErrors (errors) {
  _errors = [];
  Object.keys(errors).forEach(name => {
    // format error messages
    if (name === 'base') {
      _errors.push(errors[name]);
    } else {
      _errors.push(name + " " + errors[name]);
    }
  });
}

module.exports = ErrorStore;
