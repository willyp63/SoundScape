const dispatcher = require('../dispatcher');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');
const PlayerActions = require('./player_actions');
const TrackStore = require('../stores/track_store');
const PlayerStore = require('../stores/player_store');

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
      if (TrackStore.hasTrack(track) && PlayerStore.hasTrack(track)) {
        track.like_count--;
      }
      PlayerActions.likePlayingTrack(track);
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
        PlayerActions.replaceTrack(track, newTrack);
        that.replaceTrack(track, newTrack);
        if (TrackStore.hasTrack(newTrack) && PlayerStore.hasTrack(newTrack)) {
          newTrack.like_count--;
        }
        PlayerActions.likePlayingTrack(newTrack);
        dispatcher.dispatch({
          actionType: 'LIKE_TRACK',
          track: newTrack
        });
      });
    }, ErrorActions.setErrors);
  },
  unlikeTrack (track) {
    TrackApiUtil.unlikeTrack(track, function () {
      if (TrackStore.hasTrack(track) && PlayerStore.hasTrack(track)) {
        track.like_count++;
      }
      PlayerActions.unlikePlayingTrack(track);
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
      PlayerActions.unlikePlayingTrack(track);
    }.bind(this));
  },
  postTrack (track) {
    TrackApiUtil.postTrack(track, function (track) {
      this.receiveTrack(track);
      dispatcher.dispatch({
        actionType: 'HIDE_MODAL'
      });
    }.bind(this), ErrorActions.setErrors);
  },
  updateTrack (track) {
    TrackApiUtil.updateTrack(track, function (oldTrack, newTrack) {
      this.replaceTrack(oldTrack, newTrack);
      dispatcher.dispatch({
        actionType: 'HIDE_MODAL'
      });
    }.bind(this), ErrorActions.setErrors);
  },
  deleteTrack (track) {
    TrackApiUtil.deleteTrack(track, function (track) {
      this.removeTrack(track);
      dispatcher.dispatch({
        actionType: 'HIDE_MODAL'
      });
    }.bind(this), ErrorActions.setErrors);
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
  },
  setIndexType (indexType) {
    dispatcher.dispatch({
      actionType: 'SET_INDEX_TYPE',
      indexType: indexType
    });
  }
};
