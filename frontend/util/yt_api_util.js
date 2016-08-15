const Searcher = require('./searcher');
const NODE_SERVER_URL = 'thawing-bastion-97540.herokuapp.com';

// store requests until gapi has loaded
let _gapiLoaded = false;
let _unprocessedRequests = [];
window.onClientLoad = function () {
  gapi.client.load('youtube', 'v3', function () {
    gapi.client.setApiKey('AIzaSyD8hbRI2KVPzef84BQPtkwcqXD9XcTLgbE');
    _gapiLoaded = true;
    processUnprocessedRequests();
  });
};

function processUnprocessedRequests () {
  _unprocessedRequests.forEach(request => {
    processRequest(request[0], request[1], request[2]);
  });
  _unprocessedRequests = [];
}

// EXPORTS
module.exports = {
  searchYoutube (track, options, cb) {
    if (_gapiLoaded) {
      processRequest(track, options, cb);
    } else {
      // store request to process later
      _unprocessedRequests.push([track, options, cb]);
    }
  }
};

function processRequest (track, options, cb) {
  // ignore cache if logging
  if (options.logs) {
    searchTrack(track, options, cb);
  } else {
    checkCache(track, options, cb);
  }
}

function checkCache (track, options, cb) {
  $.ajax({
    url: `http://${NODE_SERVER_URL}/ytid/${track.spotify_id}`,
    method: 'GET',
    dataType: 'JSON',
    success (response) {
      // return ytid from cache or do search
      if (response.ytid && !options['blacklistIds'].includes(response.ytid)) {
        cb(response.ytid);
      } else {
        searchTrack(track, options, cb);
      }
    }
  });
}

function searchTrack (track, options, cb) {
  const searcher = new Searcher(track, options);
  searcher.search(function (bestItem) {
    if (bestItem) {
      // return ytid
      const ytid = bestItem.id.videoId;
      cb(ytid);

      // cache ytid in server only if first search attempt
      if (!options['blacklistIds'].length) {
        // DONT CAHCEH RIGHT NOW
        // cacheYtid(track, ytid);
      }
    } else {
      if (options.logs) { console.log(`!!!No Valid Results!!!`); }
      cb(null);
    }
  });
}

function cacheYtid (track, ytid) {
  $.ajax({
    url: `http://${NODE_SERVER_URL}/cache?ytid=${ytid}&spotifyId=${track.spotify_id}`,
    method: 'GET'
  });
}
