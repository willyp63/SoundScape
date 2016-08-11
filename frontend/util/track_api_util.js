const SpotifyApiUtil = require('./spotify_api_util');
const randomQueries = require('../constants/random_queries');

module.exports = {
  fetchSplashTracks (trackKeys, callBack) {
    let trackHash = {};
    let trackKeyCount = 0;
    function checkKeyCount () {
      trackKeyCount++;
      if (trackKeyCount >= trackKeys.length) {
        callBack(trackHash);
      }
    }

    trackKeys.forEach(key => {
      switch (key) {
        case 'MOST_LIKED':
          this.fetchMostLikedTracks(function (tracks) {
            trackHash[key] = tracks;
            checkKeyCount();
          }, 20, 0);
          break;
        case 'MOST_RECENT':
          this.fetchMostRecentTracks(function (tracks) {
            trackHash[key] = tracks;
            checkKeyCount();
          }, 20, 0);
          break;
        case 'RANDOM_ARTIST':
          const i = Math.floor(Math.random() * randomQueries.length);
          SpotifyApiUtil.searchTracks(function (tracks) {
            trackHash[key] = tracks;
            checkKeyCount();
          }, randomQueries[i], 20, 0);
          break;
      }
    });
  },
  fetchAllTracks (callBack, limit, offset) {
    $.ajax({
      url: '/api/tracks',
      method: 'GET',
      dataType: 'JSON',
      data: {limit: limit, offset: offset},
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  fetchReportedTracks (callBack, limit, offset) {
    $.ajax({
      url: '/api/tracks/reported',
      method: 'GET',
      dataType: 'JSON',
      data: {limit: limit, offset: offset},
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  fetchMostLikedTracks (callBack, limit, offset) {
    $.ajax({
      url: '/api/tracks/most_liked',
      method: 'GET',
      dataType: 'JSON',
      data: {limit: limit, offset: offset},
      success (tracks) {
        callBack(tracks);
      }
    });
  },
  fetchMostRecentTracks (callBack, limit, offset) {
    $.ajax({
      url: '/api/tracks/most_recent',
      method: 'GET',
      dataType: 'JSON',
      data: {limit: limit, offset: offset},
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
  likeTrack (track, callBack) {
    $.ajax({
      url: '/api/track_likes',
      method: 'POST',
      dataType: 'JSON',
      data: {track_like: {track_id: track.id, spotify_id: track.spotify_id}},
      success () {
        callBack();
      }
    });
  },
  unlikeTrack (track, callBack) {
    // perfer to send spotify id
    $.ajax({
      url: `/api/track_likes/${track.spotify_id || track.id}`,
      method: 'DELETE',
      dataType: 'JSON',
      success () {
        callBack();
      }
    });
  },
  postTrack (track, successCallback, errorCallback) {
    $.ajax({
      url: '/api/tracks',
      method: 'POST',
      dataType: 'JSON',
      data: {track: track},
      success (newTrack) {
        successCallback(newTrack);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  },
  postAnonymousTrack (track, successCallback, errorCallback) {
    $.ajax({
      url: '/api/tracks/anonymous',
      method: 'POST',
      dataType: 'JSON',
      data: {track: track},
      success (newTrack) {
        successCallback(newTrack);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  },
  updateTrack (track, successCallback, errorCallback) {
    $.ajax({
      url: `/api/tracks/${track.id}`,
      method: 'PATCH',
      dataType: 'JSON',
      data: {track: track},
      success (newTrack) {
        successCallback(track, newTrack);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  },
  deleteTrack (track, successCallback, errorCallback) {
    $.ajax({
      url: `/api/tracks/${track.id}`,
      method: 'DELETE',
      dataType: 'JSON',
      success (newTrack) {
        successCallback(track);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  }
};
