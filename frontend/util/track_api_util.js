module.exports = {
  fetchAllTracks (callBack) {
    $.ajax({
      url: '/api/tracks',
      method: 'GET',
      dataType: 'JSON',
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  fetchLikedTracks (callBack) {
    $.ajax({
      url: '/api/tracks/liked',
      method: 'GET',
      dataType: 'JSON',
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  fetchPostedTracks (callBack) {
    $.ajax({
      url: '/api/tracks/posted',
      method: 'GET',
      dataType: 'JSON',
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  likeTrack (track) {
    $.ajax({
      url: '/api/track_likes',
      method: 'POST',
      dataType: 'JSON',
      data: {track_like: {track_id: track.id}}
    });
  },
  unlikeTrack (track) {
    $.ajax({
      url: `/api/track_likes/${track.id}`,
      method: 'DELETE',
      dataType: 'JSON'
    });
  },
  postTrack (track, successCallback, errorCallback) {
    $.ajax({
      url: '/api/tracks',
      method: 'POST',
      dataType: 'JSON',
      data: {track: track},
      success (newUser) {
        successCallback(newUser);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  }
};
