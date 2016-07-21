const dispatcher = require('../dispatcher');
const YtdlApiUtil = require('../util/ytdl_api_util');

module.exports = {
  downloadTrack (track) {
    YtdlApiUtil.downloadTrack(track, function (newTrack) {
      dispatcher.dispatch({
        actionType: "RECIEVE_DOWNLOADED_TRACK",
        track: newTrack
      });
    });
  }
};
