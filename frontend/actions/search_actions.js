const dispatcher = require('../dispatcher');
const SpotifyApiUtil = require('../util/spotify_api_util');

module.exports = {
  searchTracks (query) {
    SpotifyApiUtil.searchTracks(query, this.receiveSearchResults);
  },
  receiveSearchResults (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_SEARCH_RESULTS',
      tracks: tracks
    });
  },
  hideSearchResults () {
    dispatcher.dispatch({
      actionType: 'HIDE_SEARCH_RESULTS'
    });
  },
  showSearchResults () {
    dispatcher.dispatch({
      actionType: 'SHOW_SEARCH_RESULTS'
    });
  }
};
