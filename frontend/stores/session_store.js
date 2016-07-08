const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _currentUser = false;

const SessionStore = new Store(dispatcher);

SessionStore.currentUser = () => _currentUser;
SessionStore.loggedIn = () => !!_currentUser;

SessionStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_CURRENT_USER":
      _currentUser = payload.currentUser;
      this.__emitChange();
      break;
    case "REMOVE_CURRENT_USER":
      _currentUser = false;
      this.__emitChange();
      break;
  }
};

module.exports = SessionStore;
