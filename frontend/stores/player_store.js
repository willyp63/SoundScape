const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _track;

const PlayerStore = new Store(dispatcher);

PlayerStore.track = () => _track;

PlayerStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "PLAY_TRACK":
      _track = payload.track;
      this.__emitChange();
      break;
  }
};

module.exports = PlayerStore;
