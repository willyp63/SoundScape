const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _tracks = {};

const TrackStore = new Store(dispatcher);

TrackStore.all = function () {
  const allTracks = [];
  Object.keys(_tracks).forEach(id => {
    if (_tracks[id]) {
      allTracks.push(_tracks[id]);
    }
  });
  return allTracks;
};

TrackStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_TRACKS":
      setTracks(payload.tracks);
      this.__emitChange();
      break;
    case "APPEND_TRACKS":
      appendTracks(payload.tracks);
      this.__emitChange();
      break;
    case "RECEIVE_TRACK":
      _tracks[payload.track.id] = payload.track;
      this.__emitChange();
      break;
    case 'LIKE_TRACK':
      _tracks[payload.track.id].liked = true;
      this.__emitChange();
      break;
    case 'UNLIKE_TRACK':
      _tracks[payload.track.id].liked = false;
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _tracks = {};
  tracks.forEach(track => {
    _tracks[track.id] = track;
  });
}

function appendTracks (tracks) {
  tracks.forEach(track => {
    _tracks[track.id] = track;
  });
}

module.exports = TrackStore;
