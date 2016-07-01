const dispatcher = require('../dispatcher');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');

module.exports = {
  fetchAllTracks (limit) {
    TrackApiUtil.fetchAllTracks(this.receiveTracks, limit);
  },
  fetchLikedTracks () {
    TrackApiUtil.fetchLikedTracks(this.receiveTracks);
  },
  fetchPostedTracks () {
    TrackApiUtil.fetchPostedTracks(this.receiveTracks);
  },
  appendAllTracks (limit, offset) {
    TrackApiUtil.appendAllTracks(this.appendTracks, limit, offset);
  },
  likeTrack (track) {
    TrackApiUtil.likeTrack(track, function () {
      dispatcher.dispatch({
        actionType: 'LIKE_TRACK',
        track: track
      });
    });
  },
  postAndLikeTrack (track) {
    TrackApiUtil.postAnonymousTrack(track, function (newTrack) {
      TrackApiUtil.likeTrack(newTrack, function () {
        dispatcher.dispatch({
          actionType: 'LIKE_RESULT',
          track: track
        });
      });
    }, ErrorActions.setErrors);
  },
  unlikeTrack (track) {
    TrackApiUtil.unlikeTrack(track, function () {
      dispatcher.dispatch({
        actionType: 'UNLIKE_TRACK',
        track: track
      });
    });
  },
  receiveTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_TRACKS',
      tracks: tracks
    });
  },
  appendTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'APPEND_TRACKS',
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
