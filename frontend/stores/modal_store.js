const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _modalType, _formType, _track;

const ModalStore = new Store(dispatcher);

ModalStore.modalType = () => _modalType;
ModalStore.formType = () => _formType;
ModalStore.track = () => _track;

ModalStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "SHOW_MODAL":
      _modalType = payload.modalType;
      _formType = payload.formType;
      _track = payload.track;
      this.__emitChange();
      break;
    case "HIDE_MODAL":
      _modalType = _formType = undefined;
      this.__emitChange();
      break;
  }
};

module.exports = ModalStore;
