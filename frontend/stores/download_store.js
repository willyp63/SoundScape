const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _track;

const DownloadStore = new Store(dispatcher);

DownloadStore.track = () => _track;

DownloadStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECIEVE_DOWNLOADED_TRACK":
      _track = payload.track;
      this.__emitChange();
      break;
  }
};

module.exports = DownloadStore;
