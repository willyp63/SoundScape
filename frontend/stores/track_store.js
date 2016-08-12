const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

// allows store to keep tracks in order
let _tracks = new LinkedHashMap();
let _splashTracks;
let _indexType, _hasMoreTracks;
let _cannotLoadTracks = false;

const TrackStore = new Store(dispatcher);

TrackStore.all = () => _tracks.all();
TrackStore.splashTracks = () => _splashTracks;
TrackStore.indexType = () => _indexType;
TrackStore.cannotLoadTracks = () => _cannotLoadTracks;
TrackStore.hasMoreTracks = function () {
  return _indexType !== 'MY_TRACKS' && _indexType !== 'MY_LIKES' && _hasMoreTracks;
};

TrackStore.getSplashTrack = function (track) {
  const keys = Object.keys(_splashTracks);
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < _splashTracks[keys[i]].length; j++) {
      const t = _splashTracks[keys[i]][j];
      if (track.spotify_id === t.spotify_id) {
        return t;
      }
    }
  }
  return null;
};

TrackStore.getAllSplashTrack = function (track) {
  if (!_splashTracks) { return []; }
  const arr = [];
  const keys = Object.keys(_splashTracks);
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < _splashTracks[keys[i]].length; j++) {
      const t = _splashTracks[keys[i]][j];
      if (track.spotify_id === t.spotify_id) {
        arr.push(t);
      }
    }
  }
  return arr;
};

TrackStore.hasTrack = function (track) {
  return !!_tracks.get(track.storeId) || !!TrackStore.getSplashTrack(track);
};

TrackStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_TRACKS":
      _cannotLoadTracks = false;
      setTracks(payload.tracks);
      this.__emitChange();
      break;
    case "RECEIVE_SPLASH_TRACK":
      receiveSplashTracks(payload.trackHash);
      this.__emitChange();
      break;
    case "APPEND_TRACKS":
      _cannotLoadTracks = false;
      appendTracks(payload.tracks);
      this.__emitChange();
      break;
    case "RECEIVE_TRACK":
      _cannotLoadTracks = false;
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
      break;
    case 'CANNOT_LOAD_TRACKS':
      _cannotLoadTracks = true;
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _hasMoreTracks = !!tracks.length;

  _tracks = new LinkedHashMap();
  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function receiveSplashTracks (trackHash) {
  _cannotLoadTracks = false;
  _splashTracks = trackHash;
  const keys = Object.keys(_splashTracks);
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < _splashTracks[keys[i]].length; j++) {
      const t = _splashTracks[keys[i]][j];
      t.storeId = t.spotify_id || t.id;
    }
  }
}

function appendTracks (tracks) {
  _hasMoreTracks = !!tracks.length;

  tracks.forEach(track => {
    storeTrack(track.id, track);
  });
}

function replaceTrack (oldTrack, newTrack) {
  const splashTracks = TrackStore.getAllSplashTrack(oldTrack);
  if (splashTracks.length) {
    // set id of for splash tracks
    splashTracks.forEach(track => {
      track.id = newTrack.id;
    });
  }
  // replace track in _tracks
  newTrack.storeId = oldTrack.storeId;
  _tracks.set(oldTrack.storeId, newTrack);
}

function storeTrack (id, track) {
  track.storeId = id;
  _tracks.addHead(id, track);
}

function likeTrack (track) {
  const ts = _tracks.get(track.storeId) ? [_tracks.get(track.storeId)] : TrackStore.getAllSplashTrack(track);
  ts.forEach(t => {
    t.liked = true;
    if (t.like_count) {
      t.like_count++;
    } else {
      t.like_count = 1;
    }
  });
}

function unlikeTrack (track) {
  const ts = _tracks.get(track.storeId) ? [_tracks.get(track.storeId)] : TrackStore.getAllSplashTrack(track);
  ts.forEach(t => {
    if (!t) { return; }
    t.liked = false;
    t.like_count--;
  });
}

module.exports = TrackStore;
