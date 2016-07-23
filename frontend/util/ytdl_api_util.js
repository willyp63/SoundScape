var io = require('socket.io-client');
var ss = require('socket.io-stream');
var BlobStream = require('blob-stream');
var WritableStream = require('stream').Writable;

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson", "tablature",
                  "how to really play", "how to play", "busking", "tutorial"];

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs"];

// setup gapi
let _gapiLoaded = false;
let _unprocessedRequests = [];
window.onClientLoad = function () {
  // setup yt api
  gapi.client.load('youtube', 'v3', function () {
    gapi.client.setApiKey('AIzaSyD8hbRI2KVPzef84BQPtkwcqXD9XcTLgbE');
    _gapiLoaded = true;

    // process requests
    _unprocessedRequests.forEach(request => {
      processRequest(request[0], request[1]);
    });
    _unprocessedRequests = [];
  });
};

module.exports = {
  downloadTrack (track, callBack) {
    if (!_gapiLoaded) {
      // store request
      _unprocessedRequests.push([track, callBack]);
    } else {
      processRequest(track, callBack);
    }
  }
};

function processRequest (track, callBack) {
  searchYoutube(track, function (ytid) {
    downloadAudio(ytid, function (url) {
      track.audio_url = url;
      callBack(track);
    });
  });
}

function searchYoutube (track, cb) {
  // get ytid from first valid result
  const trackTitle = betterTitle(track.title);
  let query = `${track.artist} ${trackTitle}`;
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    for (let i = 0; i < response.items.length; i++) {
      let result = response.items[i];
      if (!rejectedChannel(result) &&
            validResult(result, track.artist, trackTitle)){
        const ytid = result.id.videoId;
        cb(ytid);
        return;
      }
    }
    console.log(`***Unable to find YT results for query:${query}***`);
  });
}

function betterTitle (title) {
  // only take what is before '-' and '('
  let dashIdx = title.indexOf('-') - 1;
  if (dashIdx <= 0) { dashIdx = title.length; }
  let parenIdx = title.indexOf('(') - 1;
  if (parenIdx <= 0) { parenIdx = title.length; }
  const i = Math.min(dashIdx, parenIdx);
  return title.slice(0, i);
}

function validResult(result, artist, trackTitle) {
  const resultTitle = result.snippet.title;
  if (!resultTitle.match(new RegExp(artist, 'i')) ||
        !resultTitle.match(new RegExp(trackTitle, 'i'))) {
    return false;
  }
  for (let i = 0; i < FILTER_WORDS.length; i++) {
    if (resultTitle.match(new RegExp(FILTER_WORDS[i], 'i'))) {
      return false;
    }
  }
  return true;
}

function rejectedChannel (result) {
  return REJECTED_CHANNELS.includes(result.snippet.channelTitle.toLowerCase());
}

function downloadAudio (ytid, cb) {
  // connect to ytdl server
  var socket = io('https://thawing-bastion-97540.herokuapp.com/');

  // attempt to download audio
  var stream = ss.createStream();
  ss(socket).emit('download', stream, {ytid: ytid});
  stream.pipe(new BlobStream())
    .on('finish', function () {
      console.log(`***Finished Download for ytid:${ytid}***`);
      var url = this.toBlobURL();
      cb(url);
    });

  // track download
  console.log(`***Begun Download for ytid:${ytid}***`);
  let chunkNum = 0;
  const ws = new WritableStream();
  ws._write = function (chunk, type, next) {
    console.log(`*Recieved Chunk#${chunkNum++} for ytid:${ytid}*`);
    next();
  };
  stream.pipe(ws);
}
