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
  switch (payload.actionType) {
    case "SET_TRACK":
      setTracks([payload.track]);
      _newTracks = true;
      this.__emitChange();
      break;
    case "SET_TRACKS":
      setTracks(payload.tracks);
      _newTracks = true;
      this.__emitChange();
      break;
    case "CLOSE_PLAYER":
      setTracks([]);
      _newTracks = true;
      this.__emitChange();
      break;
    case "REMOVE_PLAYING_TRACK":
      removeTrack(payload.track);
      _newTracks = false;
      this.__emitChange();
      break;
    case "REPLACE_PLAYING_TRACK":
      replaceTrack(payload.oldTrack, payload.newTrack);
      _newTracks = false;
      this.__emitChange();
      break;
    case "LIKE_PLAYING_TRACK":
      likeTrack(payload.track);
      _newTracks = false;
      this.__emitChange();
      break;
    case "UNLIKE_PLAYING_TRACK":
      unlikeTrack(payload.track);
      _newTracks = false;
      this.__emitChange();
      break;
    case "SET_SHUFFLED_TRACKS":
      setTracks(payload.tracks);
      shuffleTracks();
      _newTracks = true;
      this.__emitChange();
      break;
    case "APPEND_PLAYING_TRACK":
     _newTracks = false;
     appendTrack(payload.track);
     this.__emitChange();
     break;
  }
};

function setTracks (tracks) {
  _tracks = new LinkedHashMap();
  tracks.forEach(track => {
    storeTrack(track.storeId, track);
  });
}

function storeTrack (id, track) {
  track.storeId = id;
  _tracks.addHead(id, track);
}

function removeTrack (track) {
  _tracks.remove(track.storeId);
}

function appendTrack (track) {
  if (_tracks.get(track.storeId)) { return; }
  storeTrack(track.storeId, track);
}

function replaceTrack (oldTrack, newTrack) {
  newTrack.storeId = oldTrack.storeId;
  _tracks.set(oldTrack.storeId, newTrack);
}

function likeTrack (t) {
  const track = getTrack(t);
  if (track) {
    if (!track.like_count) { track.like_count = 0; }
    track.liked = true;
    track.like_count++;
  }
}

function unlikeTrack (t) {
  const track = getTrack(t);
  if (track) {
    track.liked = false;
    track.like_count--;
  }
}

function getTrack (track) {
  const id = track.storeId || track.spotify_id;
  return _tracks.get(id);
}

function shuffleTracks () {
  const shuffledTracks = shuffle(_tracks.all());
  setTracks(shuffledTracks);
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
