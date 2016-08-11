const ReportApiUtil = require('../util/report_api_util');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');
const TrackActions = require('./track_actions');

module.exports = {
  reportTrack (track) {
    TrackApiUtil.postAnonymousTrack(track, function (newTrack) {
      ReportApiUtil.reportTrack(newTrack);
    }, ErrorActions.setErrors);
  },
  clearTrackReports (track) {
    ReportApiUtil.clearTrackReports(track);
    TrackActions.removeTrack(track);
  }
};
