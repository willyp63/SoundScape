const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _modal;

const ModalStore = new Store(dispatcher);

ModalStore.modal = () => _modal;

ModalStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "SHOW_MODAL":
      _modal = payload.modal;
      this.__emitChange();
      break;
    case "HIDE_MODAL":
      _modal = null;
      this.__emitChange();
      break;
  }
};

module.exports = ModalStore;
