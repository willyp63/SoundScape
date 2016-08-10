const dispatcher = require('../dispatcher');
const YtApiUtil = require('../util/yt_api_util');

module.exports = {
  searchYoutube (track, options = {'blacklistIds': []}) {
    YtApiUtil.searchYoutube(track, options, function (ytid) {
      dispatcher.dispatch({
        actionType: 'RECIEVE_YTID',
        track: track,
        ytid: ytid
      });
    });
  },
  blacklistId (track, ytid) {
    dispatcher.dispatch({
      actionType: 'BLACKLIST_YTID',
      track: track,
      ytid: ytid
    });
  }
};
