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
      processRequest(request[0], request[1], request[2], request[3]);
    });
    _unprocessedRequests = [];
  });
};

module.exports = {
  downloadTrack (track, onStart, onCunk, onFinish) {
    if (!_gapiLoaded) {
      // store request
      _unprocessedRequests.push([track, onStart, onCunk, onFinish]);
    } else {
      processRequest(track, onStart, onCunk, onFinish);
    }
  }
};

function processRequest (track, onStart, onChunk, onFinish) {
  searchYoutube(track, function (ytid, duration) {
    onStart(track, duration);
    downloadAudio(ytid, function () {
      onChunk(track);
    }, function (url) {
      track.audio_url = url;
      onFinish(track);
    });
  });
}

function searchYoutube (track, cb) {
  // get ytid from first valid result
  const trackTitle = titleCleaner(track.title);
  let query = `${track.artist} ${trackTitle}`;
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    for (let i = 0; i < response.items.length; i++) {
      let result = response.items[i];
      if (!rejectedChannel(result) &&
            validResult(result, track.artist, trackTitle)){
        const ytid = result.id.videoId;
        getVideoLength(ytid, function (duration) {
          cb(ytid, duration);
        });
        return;
      }
    }
    console.log(`***Unable to find YT results for query:${query}***`);
  });
}

function getVideoLength (ytid, cb) {
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: ytid
  }).execute(function (response) {
    const str = response.items[0].contentDetails.duration;
    cb(extractDuration(str));
  });
}

function extractDuration (str) {
  const minutes = parseInt(str.match(new RegExp('PT(.*)M.*S'))[1]);
  const seconds = parseInt(str.match(new RegExp('PT.*M(.*)S'))[1]);
  return (minutes * 60) + seconds;
}

function titleCleaner (title) {
 // only take what is before ' - ' and not in parens '(...)'
 let cleanedTitle = "";
 let betweenParens = false;
 let end_point = title.indexOf(" - ");
 end_point = (end_point === -1 ? title.length : end_point);
 for (let i = 0; i < end_point; i++) {
   if (betweenParens) {
     continue;
   } else if (title[i] === "(") {
     betweenParens = true;
   } else if (title[i] === ")" && betweenParens) {
     betweenParens = false;
   } else {
     cleanedTitle += title[i];
   }
 }
 return cleanedTitle;
};

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

function downloadAudio (ytid, onChunk, onFinish) {
  // connect to ytdl server
  var socket = io('https://thawing-bastion-97540.herokuapp.com/');

  // attempt to download audio
  var stream = ss.createStream();
  ss(socket).emit('download', stream, {ytid: ytid});
  stream.pipe(new BlobStream())
    .on('finish', function () {
      var url = this.toBlobURL();
      onFinish(url);
    });

  // track download
  const ws = new WritableStream();
  ws._write = function (chunk, type, next) {
    console.log(`*Recieved Chunk for ytid:${ytid}*`);
    onChunk();
    next();
  };
  console.log(`***Begun Download for ytid:${ytid}***`);
  stream.pipe(ws).on('finish', function () {
    console.log(`***Finished Download for ytid:${ytid}***`);
  });
}
