const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

// allows store to keep tracks in order
let _tracks = new LinkedHashMap();
let _indexType;

const TrackStore = new Store(dispatcher);

TrackStore.all = () => _tracks.all();
TrackStore.indexType = () => _indexType;

TrackStore.hasTrack = function (track) {
  return !!(_tracks.get(track.storeId));
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
      likeTrack(payload.track);
      this.__emitChange();
      break;
    case 'UNLIKE_TRACK':
      unlikeTrack(payload.track);
      this.__emitChange();
      break;
    case 'REPLACE_TRACK':
      replaceTrack(payload.oldTrack, payload.newTrack);
      this.__emitChange();
      break;
    case 'REMOVE_TRACK':
      _tracks.remove(payload.track.storeId);
      this.__emitChange();
      break;
    case 'SET_INDEX_TYPE':
      _indexType = payload.indexType;
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _tracks = new LinkedHashMap();
  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function appendTracks (tracks) {
  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function replaceTrack (oldTrack, newTrack) {
  newTrack.storeId = oldTrack.id;
  _tracks.set(oldTrack.id, newTrack);
}

function storeTrack (id, track) {
  track.storeId = id;
  _tracks.addHead(id, track);
}

function likeTrack (track) {
  const t = _tracks.get(track.storeId);
  if (!t) { return; }
  t.liked = true;
  t.like_count++;
}

function unlikeTrack (track) {
  const t = _tracks.get(track.storeId);
  if (!t) { return; }
  t.liked = false;
  t.like_count--;
}

module.exports = TrackStore;
