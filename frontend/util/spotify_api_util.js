module.exports = {
  searchTracks (query, callBack) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {q: query, type: 'track', limit: 10},
      success: function (response) {
        callBack(response.tracks.items);
      }
    });
  }
};
