const dispatcher = require('../dispatcher');
const SpotifyApiUtil = require('../util/spotify_api_util');

module.exports = {
  searchTracksInDropDown (query, limit) {
    SpotifyApiUtil.searchTracks(this.receiveDropDownResults, query, limit, 0);
  },
  searchTracks (query, limit, offset) {
    if (offset) {
      SpotifyApiUtil.searchTracks(this.appendSearchResults, query, limit, offset);
    } else {
      SpotifyApiUtil.searchTracks(this.receiveSearchResults, query, limit, offset);
    }
  },
  appendSearchResults (tracks) {
    dispatcher.dispatch({
      actionType: 'APPEND_RESULTS',
      results: tracks
    });
  },
  receiveSearchResults (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_RESULTS',
      results: tracks
    });
  },
  receiveDropDownResults (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_DROP_DOWN_RESULTS',
      results: tracks
    });
  },
  hideSearchResults () {
    dispatcher.dispatch({
      actionType: 'HIDE_RESULTS'
    });
  },
  showSearchResults () {
    dispatcher.dispatch({
      actionType: 'SHOW_RESULTS'
    });
  }
};
