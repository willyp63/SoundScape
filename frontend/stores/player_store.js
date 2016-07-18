const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

let _tracks = new LinkedHashMap();
let _newTracks = false;

const PlayerStore = new Store(dispatcher);

PlayerStore.tracks = () => _tracks.all();
PlayerStore.newTracks = () => _newTracks;

PlayerStore.hasTrack = function (track) {
  return !!(_tracks.get(track.storeId));
};

PlayerStore.__onDispatch = function (payload) {
  let track;
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
      track = _tracks.get(payload.track.storeId) || _tracks.get(payload.track.spotify_id);
      if (!track) { break; }
      track.liked = true;
      track.like_count++;
      _newTracks = false;
      this.__emitChange();
      break;
    case "UNLIKE_PLAYING_TRACK":
      track = _tracks.get(payload.track.storeId) || _tracks.get(payload.track.spotify_id);
      if (!track) { break; }
      track.liked = false;
      track.like_count--;
      _newTracks = false;
      this.__emitChange();
      break;
    case "SHUFFLE_TRACKS":
      const shuffledTracks = shuffle(_tracks.all());
      setTracks(shuffledTracks);
      _newTracks = true;
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

function shuffle (tracks) {
  let i = tracks.length;
  while (i !== 0) {
    let k = Math.floor(Math.random() * i);
    i--;

    let temp = tracks[i];
    tracks[i] = tracks[k];
    tracks[k] = temp;
  }
  return tracks;
}

module.exports = PlayerStore;
