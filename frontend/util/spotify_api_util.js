module.exports = {
  searchTracks (callBack, query, limit, offset) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {q: query, type: 'track', limit: limit, offset: offset},
      success: function (response) {
        callBack(response.tracks.items.map(extractTrack));
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
          id: track.id};
}
