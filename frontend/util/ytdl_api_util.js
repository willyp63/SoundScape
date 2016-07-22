var ss = require('socket.io-stream');
var BlobStream = require('blob-stream');

module.exports = {
  downloadTrack (track, callBack) {
    const q = `${track.title} ${track.artist}`;
    searchYoutube(q, function (ytid) {
      downloadAudio(ytid, function (url) {
        track.audio_url = url;
        callBack(track);
      });
    });
  }
};

function searchYoutube (q, cb) {
  // get ytid from first result
  gapi.client.youtube.search.list({
    part: 'snippet', q: q, maxResults: 1
  }).execute(function (response) {
    const ytid = response.items[0].id.videoId;
    cb(ytid);
  });
}

function downloadAudio (ytid, cb) {
  // connect to ytdl server
  var socket = io('thawing-bastion-97540.herokuapp.com',
                      {'transports': ['websocket', 'polling']});

  // attempt to download audio
  var stream = ss.createStream();
  ss(socket).emit('download', stream, {ytid: ytid});
  stream.pipe(new BlobStream())
    .on('finish', function () {
      var url = this.toBlobURL();
      cb(url);
    });
}
