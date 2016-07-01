const HEROKU_URL = 'https://salty-falls-17641.herokuapp.com';
const LOCAL_URL = 'http://localhost:3000';

seed(30, LOCAL_URL);

function randomLetters (n) {
  let letters = "";
  for (let i = 0; i < n; i++) {
    const charCode = 97 + Math.floor(Math.random() * 26);
    letters += String.fromCharCode(charCode);
  }
  return letters;
};

function randomTrack (callBack) {
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {q: randomLetters(2), type: 'track', limit: 1},
    success: function (response) {
      callBack(response.tracks.items[0]);
    }
  });
};

function extractTrack (track) {
  return {title: track.name,
          audio_url: track.preview_url,
          image_url: track.album.images[1].url};
}

function postTrack (track, url) {
  $.ajax({
    url: `${url}/api/tracks`,
    method: 'POST',
    dataType: 'JSON',
    data: {track: extractTrack(track)},
    success (newUser) {
      console.log("success");
    },
    error (errors) {
      console.log(errors);
    }
  });
}

function seed (n, url) {
  for (let i = 0; i < n; i++) {
    randomTrack(function (track) {
      postTrack(track, url);
    });
  }
}
