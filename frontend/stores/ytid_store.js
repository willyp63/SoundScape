const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _ids = {};

const YTDL_URL_PREFIX = 'http://localhost:8080/download/';

const YtidStore = new Store(dispatcher);

YtidStore.hasId = function (track) {
  return !!(_ids[track.storeId]);
};

YtidStore.getUrl = function (track) {
  return YTDL_URL_PREFIX + _ids[track.storeId];
};

YtidStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECIEVE_YTID":
      _ids[payload.track.storeId] = payload.ytid;
      this.__emitChange();
      break;
  }
};

module.exports = YtidStore;
