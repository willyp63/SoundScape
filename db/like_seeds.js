const HEROKU_URL = 'https://salty-falls-17641.herokuapp.com';
const LOCAL_URL = 'http://localhost:3000';

seed(100, 105, 2000, LOCAL_URL);

function postRandomLike (numUsers, numTracks, url) {
  const userId = Math.floor(Math.random() * numUsers);
  const trackId = Math.floor(Math.random() * numTracks);
  $.ajax({
    url: `${url}/api/track_likes`,
    method: 'POST',
    dataType: 'JSON',
    data: {track_like: {user_id: userId, track_id: trackId}},
    success (newTrack) {
      console.log("success");
    },
    error (errors) {
      console.log(errors);
    }
  });
}

function seed (numUsers, numTrack, numLikes, url) {
  for (let i = 0; i < numLikes; i++) {
    postRandomLike(numUsers, numTrack, url);
  }
}
