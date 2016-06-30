const dispatcher = require('../dispatcher');

module.exports = {
  playTrack (track) {
    dispatcher.dispatch({
      actionType: 'PLAY_TRACK',
      track: track
    });
  }
};
