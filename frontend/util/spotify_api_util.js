const dispatcher = require('../dispatcher');
const SessionStore = require('../stores/session_store');
const SearchStringUtil = require('./search/string_util');

module.exports = {
  searchTracks (callBack, query, limit, offset, attempts) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {q: query, type: 'track', limit: limit, offset: offset},
      success: function (response) {
        let tracks = response.tracks.items.map(extractTrack);
        tracks = uniqueTracks(tracks);
        if (SessionStore.loggedIn()) {
          this.buildLikedTracks(function (builtTracks) {
            callBack(builtTracks);
          }, tracks);
        } else {
          callBack(tracks);
        }
      }.bind(this),
      error: function (data) {
        attempts = attempts ? attempts + 1 : 1;
        if (attempts > 5) {
          // give up
          dispatcher.dispatch({
            actionType: 'CANNOT_LOAD_TRACKS'
          });
          dispatcher.dispatch({
            actionType: "SHOW_MODAL",
            modal: {type: 'CANNOT_CONNECT', action: 'INFO', data: null}
          });
        } else {
          // try again
          console.log('trying again...');
          this.searchTracks(callBack, query, limit, offset, attempts);
        }
      }.bind(this)
    });
  },
  buildLikedTracks (callBack, tracks) {
    // avoid unnecessary request
    if (!tracks.length) { callBack(tracks); return; }

    $.ajax({
      url: '/api/tracks/build_liked',
      method: 'POST',
      dataType: 'JSON',
      data: {tracks: tracks},
      success: function (response) {
        callBack(response);
      }
    });
  }
};

function uniqueTracks (tracks) {
  const seenQueries = {};
  const uniqueTracks = [];
  tracks.forEach(function (track) {
    const title = SearchStringUtil.cleanSpotifyTitle(track.title);
    const query = track.artists[0] + title;
    if (!seenQueries[query]) {
      seenQueries[query] = true;
      uniqueTracks.push(track);
    }
  });
  return uniqueTracks;
}

function extractTrack (track) {
 const hasImage = !!track.album.images.length;
 return {title: track.name,
         image_url: (hasImage ? track.album.images[1].url : ""),
         artists: track.artists.map(artist => artist.name),
         id: track.id,
         duration_sec: track.duration_ms / 1000,
         spotify_id: track.id};
}
