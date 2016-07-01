const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _results = {};
let _dropDownResults = {};
let _showing = false;

const SearchResultStore = new Store(dispatcher);

SearchResultStore.showing = () => _showing;

SearchResultStore.all = function (limit) {
  const allTracks = [];
  const ids = Object.keys(_results);
  if (!limit) { limit = ids.length; }
  for (let i = 0; i < ids.length && i < limit;) {
    const id = ids[i];
    if (_results[id]) {
      allTracks.push(_results[id]);
      i++;
    }
  }
  return allTracks;
};

SearchResultStore.dropDownResults = function () {
  const allTracks = [];
  Object.keys(_dropDownResults).forEach(id => {
    if (_dropDownResults[id]) {
      allTracks.push(_dropDownResults[id]);
    }
  });
  return allTracks;
};

SearchResultStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_DROP_DOWN_RESULTS":
      setDropDownResults(payload.results);
      this.__emitChange();
      break;
    case "RECEIVE_RESULTS":
      setTracks(payload.results);
      this.__emitChange();
      break;
    case "APPEND_RESULTS":
      appendTracks(payload.results);
      this.__emitChange();
      break;
    case "HIDE_RESULTS":
      _showing = false;
      this.__emitChange();
      break;
    case "SHOW_RESULTS":
      _showing = true;
      this.__emitChange();
      break;
    case "LIKE_RESULT":
      _results[payload.track.id].liked = true;
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _results = {};
  tracks.forEach(track => {
    _results[track.id] = track;
  });
}

function setDropDownResults (tracks) {
  _dropDownResults = {};
  tracks.forEach(track => {
    _dropDownResults[track.id] = track;
  });
}

function appendTracks (tracks) {
  tracks.forEach(track => {
    _results[track.id] = track;
  });
}

module.exports = SearchResultStore;
