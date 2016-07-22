const dispatcher = require('../dispatcher');
const DownloadActions = require('./download_actions');

module.exports = {
  playTrack (track) {
    dispatcher.dispatch({
      actionType: 'SET_TRACK',
      track: track
    });
    DownloadActions.downloadNeededTracks();
  },
  playTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'SET_TRACKS',
      tracks: tracks
    });
    DownloadActions.downloadNeededTracks();
  },
  removePlayingTrack (track) {
    dispatcher.dispatch({
      actionType: "REMOVE_PLAYING_TRACK",
      track: track
    });
    DownloadActions.downloadNeededTracks();
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
  },
  playShuffledTracks (tracks) {
    dispatcher.dispatch({
      actionType: 'SET_TRACKS',
      tracks: tracks
    });
    dispatcher.dispatch({
      actionType: 'SHUFFLE_TRACKS'
    });
    DownloadActions.downloadNeededTracks();
  },
  playNextTrack () {
    dispatcher.dispatch({
      actionType: 'PLAY_NEXT_TRACK'
    });
    DownloadActions.downloadNeededTracks();
  },
  playPrevTrack () {
    dispatcher.dispatch({
      actionType: 'PLAY_PREV_TRACK'
    });
    DownloadActions.downloadNeededTracks();
  },
  playThisTrack (track) {
    dispatcher.dispatch({
      actionType: 'PLAY_THIS_TRACK',
      track: track
    });
    DownloadActions.downloadNeededTracks();
  }
};
