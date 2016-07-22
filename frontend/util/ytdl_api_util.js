var io = require('socket.io-client');
var ss = require('socket.io-stream');
var BlobStream = require('blob-stream');
var WritableStream = require('stream').Writable;

const filterwords = ["live", "cover", "parody", "parodie", "karaoke",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson",
                  "how to really play", "how to play", "busking", "tutorial"];

const rejectedChannels = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs"];

module.exports = {
  downloadTrack (track, callBack) {
    searchYoutube(track, function (ytid) {
      downloadAudio(ytid, function (url) {
        track.audio_url = url;
        callBack(track);
      });
    });
  }
};

function searchYoutube (track, cb) {
  // get ytid from first result
  let query = `${track.artist} ${track.title}`;
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    for (let i = 0; i < response.items.length; i++) {
      let result = response.items[i];
      if (validResult(result.snippet.title, track) && notRejectedChannel(result)){
        const ytid = result.id.videoId;
        cb(ytid);
        return;
      }
    }
  });
}

function validResult(result, track) {
  result = result.toLowerCase();
  let bandName = track.artist.toLowerCase();
  let songTitle = track.title.toLowerCase();
  if (!result.includes(bandName) || !result.includes(songTitle)) {
    return false;
  }
  for (let i = 0; i < filterwords.length; i++) {
    if (result.includes(filterwords[i])) {
      return false;
    }
  }
  return true;
}

function notRejectedChannel (result) {
  if (rejectedChannels.includes(result.snippet.channelTitle.toLowerCase())) {
    return false;
  }
  return true;
}

function downloadAudio (ytid, cb) {
  // connect to ytdl server
  var socket = io('http://thawing-bastion-97540.herokuapp.com/');

  // attempt to download audio
  var stream = ss.createStream();
  ss(socket).emit('download', stream, {ytid: ytid});
  stream.pipe(new BlobStream())
    .on('finish', function () {
      console.log(`finished download: ${ytid}`);
      var url = this.toBlobURL();
      cb(url);
    });

  // track progress
  console.log(`starting download: ${ytid}`);
  const ws = new WritableStream();
  ws._write = function (chunk, type, next) {
    console.log('recieved chunk');
    next();
  };
  stream.pipe(ws);
}
