const ReportApiUtil = require('../util/report_api_util');
const TrackApiUtil = require('../util/track_api_util');
const ErrorActions = require('./error_actions');
const TrackActions = require('./track_actions');
const PlayerActions = require('./player_actions');

module.exports = {
  reportTrack (track) {
    if (typeof track.id === 'string') {
      TrackApiUtil.postAnonymousTrack(track, function (newTrack) {
        PlayerActions.replaceTrack(track, newTrack);
        TrackActions.replaceTrack(track, newTrack);
        ReportApiUtil.reportTrack(newTrack);
      }, ErrorActions.setErrors);
    } else {
      ReportApiUtil.reportTrack(track);
    }
  },
  clearTrackReports (track) {
    ReportApiUtil.clearTrackReports(track);
    TrackActions.removeTrack(track);
  }
};
