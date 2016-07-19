var fs = require('fs');
var ytdl = require('ytdl-core');

window.onClientLoad = function () {
  gapi.client.load('youtube', 'v3', function () {
    gapi.client.setApiKey('AIzaSyD8hbRI2KVPzef84BQPtkwcqXD9XcTLgbE');
    $('#search-input').on('change', search);
  });
};

function search (e) {
  var request = gapi.client.youtube.search.list({
    part: 'snippet',
    q: e.target.value,
    maxResults: 25
  });
  request.execute(onSearchResponse);
}

function onSearchResponse (response) {
  $('.search-results').empty();
  response.items.forEach(result => {
    const id = result.id.videoId;
    const title = result.snippet.title;
    const li = $(`<li>${title}</li>`);
    li.on('click', playBetterAudio.bind(this, id, title));
    $('.search-results').append(li);
  });
}

function playBetterAudio (id) {
  const yturl = `https://www.youtube.com/watch?v=${id}`;
  ytdl(yturl, {filter: "audioonly"})
    .pipe(fs.createWriteStream('overthere.mp4'));
}

function playAudio (id, title) {
  // stop old audio
  const audio = document.getElementById('audio-player');
  if (audio) { audio.pause(); }

  const player = $(`<audio id='audio-player' controls>
                      <source src=${url} type="audio/mpeg" />
                    </audio>`);
  $('#audio-container').empty();
  $('#audio-container').append(player);
  startAudio(title);
}

function startAudio (title) {
  const audio = document.getElementById('audio-player');
  audio.addEventListener("canplaythrough", function () {
    $('.spinner').remove();
    $('.title').remove();
    audio.play();
  }, false);
  $('#audio-container').append('<div class="spinner"></div>');
  $('#audio-container').append(`<span class="title">${title}</span>`);
  audio.load();
}

module.exports = playBetterAudio;
