const dispatcher = require('../dispatcher');

module.exports = {
  playTrack (track) {
    dispatcher.dispatch({
      actionType: 'PLAY_TRACK',
      track: track
    });
  },
  playTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'PLAY_TRACKS',
      tracks: tracks
    });
  },
  removePlayingTrack (track) {
    dispatcher.dispatch({
      actionType: "REMOVE_PLAYING_TRACK",
      track: track
    });
  },
  replaceTrack (oldTrack, newTrack) {
    dispatcher.dispatch({
      actionType: 'REPLACE_PLAYING_TRACK',
      oldTrack: oldTrack,
      newTrack: newTrack
    });
  },
  closePlayer () {
    dispatcher.dispatch({
      actionType: 'CLOSE_PLAYER'
    });
  },
  likePlayingTrack (track) {
    dispatcher.dispatch({
      actionType: 'LIKE_PLAYING_TRACK',
      track: track
    });
  },
  unlikePlayingTrack (track) {
    dispatcher.dispatch({
      actionType: 'UNLIKE_PLAYING_TRACK',
      track: track
    });
  }
};
