const dispatcher = require('../dispatcher');

module.exports = {
  show (modalType, formType, track) {
    dispatcher.dispatch({
      actionType: "SHOW_MODAL",
      modalType: modalType,
      formType: formType,
      track: track
    });
  },
  hide () {
    dispatcher.dispatch({
      actionType: "HIDE_MODAL"
    });
  }
};
