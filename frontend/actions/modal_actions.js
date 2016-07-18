const dispatcher = require('../dispatcher');

module.exports = {
  show (type, action, data) {
    dispatcher.dispatch({
      actionType: "SHOW_MODAL",
      modal: {type: type, action: action, data: data}
    });
  },
  hide () {
    dispatcher.dispatch({
      actionType: "HIDE_MODAL"
    });
  }
};
