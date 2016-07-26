const dispatcher = require('../dispatcher');
const YtApiUtil = require('../util/yt_api_util');

module.exports = {
  searchYoutube (track) {
    YtApiUtil.searchYoutube(track, function (ytid) {
      dispatcher.dispatch({
        actionType: 'RECIEVE_YTID',
        track: track,
        ytid: ytid
      });
    });
  }
}
