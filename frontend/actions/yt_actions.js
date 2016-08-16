const dispatcher = require('../dispatcher');
const YtApiUtil = require('../util/yt_api_util');
const ReportActions = require('./report_actions');

module.exports = {
  searchYoutube (track, options = {'blacklistIds': [], 'logs': false}) {
    YtApiUtil.searchYoutube(track, options, function (ytid) {
      dispatcher.dispatch({
        actionType: 'RECIEVE_YTID',
        track: track,
        ytid: ytid
      });
      if (!ytid) {
        ReportActions.reportTrack(track);
      }
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
