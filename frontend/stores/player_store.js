const Store = require('flux/utils').Store;
const dispatcher = require('../dispatcher');
const LinkedHashMap = require('../util/linked_hash_map');

let _tracks = new LinkedHashMap();

const PlayerStore = new Store(dispatcher);

PlayerStore.tracks = () => _tracks.all();

PlayerStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case "PLAY_TRACK":
      setTracks([payload.track]);
      this.__emitChange();
      break;
    case "PLAY_TRACKS":
      setTracks(payload.tracks);
      this.__emitChange();
      break;
  }
};

function setTracks (tracks) {
  _tracks = new LinkedHashMap();
  tracks.forEach(track => {
    _tracks.addHead(track.id, track);
  });
}

module.exports = PlayerStore;
