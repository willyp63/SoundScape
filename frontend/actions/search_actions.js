const dispatcher = require('../dispatcher');
const SpotifyApiUtil = require('../util/spotify_api_util');
const TrackActions = require('./track_actions');

module.exports = {
  searchTracks (query, limit) {
    SpotifyApiUtil.searchTracks(this.receiveResults, query, limit, 0);
  },
  fetchResults (query, limit, offset) {
    const callBack = offset ? TrackActions.appendTracks : TrackActions.receiveTracks;
    SpotifyApiUtil.searchTracks(callBack, query, limit, offset);
  },
  receiveResults (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_RESULTS',
      results: tracks
    });
  },
  hideResults () {
    dispatcher.dispatch({
      actionType: 'HIDE_RESULTS'
    });
  },
  showResults () {
    dispatcher.dispatch({
      actionType: 'SHOW_RESULTS'
    });
  }
};
