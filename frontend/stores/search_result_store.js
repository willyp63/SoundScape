const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _tracks = {};
let _showing = false;

const SearchResultStore = new Store(dispatcher);

SearchResultStore.showing = () => _showing;

SearchResultStore.all = function () {
  const allTracks = [];
  Object.keys(_tracks).forEach(id => {
    if (_tracks[id]) {
      allTracks.push(_tracks[id]);
    }
  });
  return allTracks;
};

SearchResultStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_SEARCH_RESULTS":
      setTracks(payload.tracks);
      this.__emitChange();
      break;
    case "HIDE_SEARCH_RESULTS":
      _showing = false;
      this.__emitChange();
      break;
    case "SHOW_SEARCH_RESULTS":
      _showing = true;
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

module.exports = SearchResultStore;
