const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');

let _latestIdx;
let _results = {};
let _showing = false;

const SearchResultStore = new Store(dispatcher);

SearchResultStore.showing = () => _showing;

SearchResultStore.results = function () {
  const allResults = [];
  Object.keys(_results).forEach(id => {
    if (_results[id]) {
      allResults.push(_results[id]);
    }
  });
  return allResults;
};

SearchResultStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "RECEIVE_RESULTS":
      if (!_latestIdx || payload.idx > _latestIdx) {
        _latestIdx = payload.idx;
        setResults(payload.results);
        this.__emitChange();
      }
      break;
    case "HIDE_RESULTS":
      _showing = false;
      this.__emitChange();
      break;
    case "SHOW_RESULTS":
      _showing = true;
      this.__emitChange();
      break;
  }
};

function setResults (tracks) {
  _results = {};
  tracks.forEach(track => {
    _results[track.id] = track;
  });
}

module.exports = SearchResultStore;
