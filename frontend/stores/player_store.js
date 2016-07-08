const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

let _tracks = new LinkedHashMap();
let _newTracks = false;

const PlayerStore = new Store(dispatcher);

PlayerStore.tracks = () => _tracks.all();
PlayerStore.newTracks = () => _newTracks;

PlayerStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "PLAY_TRACK":
      setTracks([payload.track]);
      _newTracks = true;
      this.__emitChange();
      break;
    case "PLAY_TRACKS":
      setTracks(payload.tracks);
      _newTracks = true;
      this.__emitChange();
      break;
    case "CLOSE_PLAYER":
      setTracks([]);
      this.__emitChange();
      _newTracks = true;
      break;
    case "REMOVE_PLAYING_TRACK":
      _tracks.remove(payload.track.id);
      _newTracks = true;
      this.__emitChange();
      break;
    case "REPLACE_PLAYING_TRACK":
      payload.newTrack.storeId = payload.oldTrack.storeId;
      _tracks.set(payload.oldTrack.storeId, payload.newTrack);
      _newTracks = false;
      this.__emitChange();
      break;
    case "LIKE_PLAYING_TRACK":
      _tracks.get(payload.track.storeId).liked = true;
      _tracks.get(payload.track.storeId).like_count++;
      _newTracks = false;
      this.__emitChange();
      break;
    case "UNLIKE_PLAYING_TRACK":
      _tracks.get(payload.track.storeId).liked = false;
      _tracks.get(payload.track.storeId).like_count--;
      _newTracks = false;
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

function storeTrack (id, track) {
  track.storeId = id;
  _tracks.addHead(id, track);
}

module.exports = PlayerStore;
