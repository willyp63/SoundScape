const dispatcher = require('../dispatcher');
const SessionApiUtil = require('../util/session_api_util');
const ErrorActions = require('./error_actions');

module.exports = {
  signup (user) {
    SessionApiUtil.signup(user,
      this.receiveCurrentUser,
      ErrorActions.setErrors);
  },
  login (user) {
    SessionApiUtil.login(user,
      this.receiveCurrentUser,
      ErrorActions.setErrors);
  },
  logout () {
    SessionApiUtil.logout(this.removeCurrentUser);
  },
  receiveCurrentUser (user) {
    dispatcher.dispatch({
      actionType: "RECEIVE_CURRENT_USER",
      currentUser: user
    });
    dispatcher.dispatch({
      actionType: "HIDE_MODAL"
    });
  },
  removeCurrentUser () {
    dispatcher.dispatch({
      actionType: "REMOVE_CURRENT_USER"
    });
  }
};
