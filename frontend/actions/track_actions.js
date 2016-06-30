const dispatcher = require('../dispatcher');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');

module.exports = {
  fetchAllTracks () {
    TrackApiUtil.fetchAllTracks(this.receiveTracks);
  },
  fetchLikedTracks () {
    TrackApiUtil.fetchLikedTracks(this.receiveTracks);
  },
  fetchPostedTracks () {
    TrackApiUtil.fetchPostedTracks(this.receiveTracks);
  },
  likeTrack (track) {
    TrackApiUtil.likeTrack(track);
    dispatcher.dispatch({
      actionType: 'LIKE_TRACK',
      track: track
    });
  },
  unlikeTrack (track) {
    TrackApiUtil.unlikeTrack(track);
    dispatcher.dispatch({
      actionType: 'UNLIKE_TRACK',
      track: track
    });
  },
  receiveTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_TRACKS',
      tracks: tracks
    });
  },
  postTrack (track) {
    TrackApiUtil.postTrack(track,
                           this.receiveTrack,
                           ErrorActions.setErrors);
  },
  receiveTrack (track) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_TRACK',
      track: track
    });
  }
};
