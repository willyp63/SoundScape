module.exports = {
  reportTrack (track) {
    $.ajax({
      url: '/api/reports',
      method: 'POST',
      dataType: 'JSON',
      data: {report: {spotify_id: track.spotify_id}},
      error (errors) {
        console.log(errors);
      }
    });
  },
  clearTrackReports (track) {
    $.ajax({
      url: `/api/reports/clear_track/${track.id}`,
      method: 'DELETE',
      dataType: 'JSON',
      error (errors) {
        console.log(errors);
      }
    });
  }
};
