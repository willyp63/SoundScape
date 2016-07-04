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
      storeTrack(payload.track.id, payload.track);
      this.__emitChange();
      break;
    case 'LIKE_TRACK':
      _tracks[payload.track.storeId].liked = true;
      this.__emitChange();
      break;
    case 'UNLIKE_TRACK':
      _tracks[payload.track.storeId].liked = false;
      this.__emitChange();
      break;
    case 'REPLACE_TRACK':
      storeTrack(payload.oldTrack.id, payload.newTrack);
      this.__emitChange();
      break;
    case 'REMOVE_TRACK':
      _tracks[payload.track.storeId] = undefined;
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _tracks = {};
  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function appendTracks (tracks) {
  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function storeTrack (id, track) {
  track.storeId = id;
  _tracks[id] = track;
}

module.exports = TrackStore;
