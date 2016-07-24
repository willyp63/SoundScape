const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

let _tracks = new LinkedHashMap();
let _urls = {};
let _numChunks = {};
let _durations = {};
let _playIndex = 0;

const PlayerStore = new Store(dispatcher);

PlayerStore.tracks = () => _tracks.all();
PlayerStore.playIndex = () => _playIndex;
PlayerStore.playTrack = () => getPlayTrack();
PlayerStore.nextTrack = () => getNextTrack();

PlayerStore.hasTrack = function (track) {
  return !!(_tracks.get(track.storeId));
};

PlayerStore.loadingOrHasUrl = function (track) {
  return !!(this.getUrl(track));
};

PlayerStore.hasUrl = function (track) {
  const url = this.getUrl(track);
  return (url && url !== 'LOADING');
};

PlayerStore.getUrl = function (track) {
  return _urls[track.storeId];
};

PlayerStore.getChunks = function (track) {
  return _numChunks[track.storeId];
};

PlayerStore.getDuration = function (track) {
  return _durations[track.storeId];
};

PlayerStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "SET_TRACK":
      setTracks([payload.track]);
      this.__emitChange();
      break;
    case "SET_TRACKS":
      setTracks(payload.tracks);
      this.__emitChange();
      break;
    case "CLOSE_PLAYER":
      setTracks([]);
      this.__emitChange();
      break;
    case "REMOVE_PLAYING_TRACK":
      removeTrack(payload.track);
      this.__emitChange();
      break;
    case "REPLACE_PLAYING_TRACK":
      replaceTrack(payload.oldTrack, payload.newTrack);
      this.__emitChange();
      break;
    case "LIKE_PLAYING_TRACK":
      likeTrack(payload.track);
      this.__emitChange();
      break;
    case "UNLIKE_PLAYING_TRACK":
      unlikeTrack(payload.track);
      this.__emitChange();
      break;
    case "SHUFFLE_TRACKS":
      shuffleTracks();
      this.__emitChange();
      break;
    case "PLAY_NEXT_TRACK":
      next();
      this.__emitChange();
      break;
    case "PLAY_PREV_TRACK":
      prev();
      this.__emitChange();
      break;
    case "PLAY_THIS_TRACK":
      playTrack(payload.track);
      this.__emitChange();
      break;
    case "RECIEVE_DOWNLOADED_TRACK":
      recieveDownloadedTrack(payload.track);
      this.__emitChange();
      break;
    case "START_DOWNLOADING_TRACK":
      startDownloadingTrack(payload.track, payload.duration);
      this.__emitChange();
      break;
    case "RECIEVE_DOWNLOAD_CHUNK":
      recieveDownloadChunk(payload.track);
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _playIndex = 0;
  _tracks = new LinkedHashMap();
  _numChunks = {};
  _durations = {};
  _urls = {};
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
  if (_playIndex >= _tracks.all().length) { _playIndex = 0; }
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

function next () {
  _playIndex += 1;
  if (_playIndex >= _tracks.all().length) { _playIndex = 0; }
}

function prev () {
  _playIndex -= 1;
  if (_playIndex < 0) { _playIndex = _tracks.all().length - 1; }
}

function playTrack (track) {
  const newIndex = _tracks.all().indexOf(track);
  if (newIndex >= 0) { _playIndex = newIndex; }
}

function getPlayTrack () {
  return _tracks.all()[_playIndex];
}

function getNextTrack () {
  let nextIdx = _playIndex + 1;
  if (nextIdx >= _tracks.all().length) { nextIdx = 0; }
  return _tracks.all()[nextIdx];
}

function recieveDownloadedTrack (track) {
  if (_tracks.get(track.storeId)) {
    _urls[track.storeId] = track.audio_url;
  }
}

function recieveDownloadChunk (track) {
  if (_tracks.get(track.storeId)) {
    _urls[track.storeId] = 'LOADING';
    _numChunks[track.storeId]++;
  }
}

function startDownloadingTrack (track, duration) {
  if (_tracks.get(track.storeId)) {
    _urls[track.storeId] = 'LOADING';
    _numChunks[track.storeId] = 0;
    _durations[track.storeId] = duration;
  }
}

module.exports = PlayerStore;
