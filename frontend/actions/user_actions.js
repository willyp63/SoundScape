const SessionActions = require('./session_actions');
const UserApiUtil = require('../util/user_api_util');
const ErrorActions = require('./error_actions');

module.exports = {
  updateUser (user) {
    UserApiUtil.updateUser(user,
      SessionActions.receiveCurrentUser,
      ErrorActions.setErrors);
  }
};
