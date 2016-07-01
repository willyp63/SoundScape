const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _errors;

const ErrorStore = new Store(dispatcher);

ErrorStore.errors = () => _errors;

ErrorStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_ERRORS":
      _errors = payload.errors;
      this.__emitChange();
      break;
    case "REMOVE_ERRORS":
      _errors = undefined;
      this.__emitChange();
      break;
  }
};

module.exports = ErrorStore;
