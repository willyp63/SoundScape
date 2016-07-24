const dispatcher = require('../dispatcher');
const YtdlApiUtil = require('../util/ytdl_api_util');
const PlayerStore = require('../stores/player_store');

module.exports = {
  downloadTrack (track) {
    YtdlApiUtil.downloadTrack(track, function (downloadTrack, duration) {
      dispatcher.dispatch({
        actionType: "START_DOWNLOADING_TRACK",
        track: downloadTrack,
        duration: duration
      });
    }, function (downloadTrack) {
      dispatcher.dispatch({
        actionType: "RECIEVE_DOWNLOAD_CHUNK",
        track: downloadTrack
      });
    }, function (newTrack) {
      dispatcher.dispatch({
        actionType: "RECIEVE_DOWNLOADED_TRACK",
        track: newTrack
      });
      this.downloadNeededTracks();
    }.bind(this));
  },
  downloadNeededTracks () {
    const playTrack = PlayerStore.playTrack();
    if (!PlayerStore.loadingOrHasUrl(playTrack)) {
      this.downloadTrack(playTrack);
    } else if (PlayerStore.hasUrl(playTrack)) {
      const nextTrack = PlayerStore.nextTrack();
      if (!PlayerStore.loadingOrHasUrl(nextTrack)) {
        this.downloadTrack(nextTrack);
      }
    }
  }
};
