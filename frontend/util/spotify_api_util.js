module.exports = {
  searchTracks (callBack, query, limit, offset) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {q: query, type: 'track', limit: limit, offset: offset},
      success: function (response) {
        const tracks = response.tracks.items.map(extractTrack);
        this.buildLikedTracks(function (builtTracks) {
          callBack(builtTracks);
        }, tracks);
      }.bind(this)
    });
  },
  buildLikedTracks (callBack, tracks) {
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

function extractTrack (track) {
  const hasImage = !!track.album.images.length;
  return {title: track.name,
          audio_url: track.preview_url,
          image_url: (hasImage ? track.album.images[1].url : ""),
          artist: track.artists[0].name,
          id: track.id,
          spotify_id: track.id};
}
