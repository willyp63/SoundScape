const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

const NODE_SERVER_URL = 'localhost:8080';
const YTDL_URL_PREFIX = `http://${NODE_SERVER_URL}/stream`;
const _ids = {};
const _blacklist = {};
const REQUIRED_ENCODING = getRequiredEncoding();

const YtidStore = new Store(dispatcher);

YtidStore.hasId = function (track) {
  return !!(_ids[track.storeId]);
};

YtidStore.getId = function (track) {
  return _ids[track.storeId];
};

YtidStore.getUrl = function (track) {
  return `${YTDL_URL_PREFIX}?ytid=${_ids[track.storeId]}&encoding=${REQUIRED_ENCODING}`;
};

YtidStore.getBlacklist = function (track) {
  return _blacklist[track.storeId];
};

YtidStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECIEVE_YTID":
      _ids[payload.track.storeId] = payload.ytid ? payload.ytid : 'NOT_FOUND';
      this.__emitChange();
      break;
    case "BLACKLIST_YTID":
      if (_blacklist[payload.track.storeId]) {
        _blacklist[payload.track.storeId].push(payload.ytid);
      } else {
        _blacklist[payload.track.storeId] = [payload.ytid];
      }
      this.__emitChange();
      break;
  }
};

module.exports = YtidStore;

function getRequiredEncoding () {
  const audio = document.createElement('audio');
  if (audio.canPlayType('audio/mp4;codecs="aac"')) {
    return 'aac';
  } else if (audio.canPlayType('audio/ogg;codecs="opus"')) {
    return 'opus';
  }
  return null;
}
