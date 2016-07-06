const dispatcher = require('../dispatcher');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');

module.exports = {
  fetchAllTracks (limit, offset) {
    const cb = offset ? this.appendTracks : this.receiveTracks;
    TrackApiUtil.fetchAllTracks(cb, limit, offset);
  },
  fetchMostLikedTracks (limit, offset) {
    const cb = offset ? this.appendTracks : this.receiveTracks;
    TrackApiUtil.fetchMostLikedTracks(cb, limit, offset);
  },
  fetchMostRecentTracks (limit, offset) {
    const cb = offset ? this.appendTracks : this.receiveTracks;
    TrackApiUtil.fetchMostRecentTracks(cb, limit, offset);
  },
  fetchLikedTracks () {
    TrackApiUtil.fetchLikedTracks(this.receiveTracks);
  },
  fetchPostedTracks () {
    TrackApiUtil.fetchPostedTracks(this.receiveTracks);
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
    const that = this;
    TrackApiUtil.postAnonymousTrack(track, function (newTrack) {
      TrackApiUtil.likeTrack(newTrack, function () {
        that.replaceTrack(track, newTrack);
        dispatcher.dispatch({
          actionType: 'LIKE_TRACK',
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
  unlikeAndRemoveTrack (track) {
    TrackApiUtil.unlikeTrack(track, function () {
      this.removeTrack(track);
    }.bind(this));
  },
  postTrack (track) {
    TrackApiUtil.postTrack(track,
                           this.receiveTrack,
                           ErrorActions.setErrors);
  },
  updateTrack (track) {
    TrackApiUtil.updateTrack(track,
                             this.replaceTrack,
                             ErrorActions.setErrors);
  },
  deleteTrack (track) {
    TrackApiUtil.deleteTrack(track,
                             this.removeTrack,
                             ErrorActions.setErrors);
  },
  receiveTrack (track) {
    dispatcher.dispatch({
      actionType: 'RECEIVE_TRACK',
      track: track
    });
  },
  removeTrack (track) {
    dispatcher.dispatch({
      actionType: 'REMOVE_TRACK',
      track: track
    });
  },
  replaceTrack (oldTrack, newTrack) {
    dispatcher.dispatch({
      actionType: 'REPLACE_TRACK',
      oldTrack: oldTrack,
      newTrack: newTrack
    });
  }
};
