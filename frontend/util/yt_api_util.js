const SearchStringUtil = require('./search_string_util');

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson", "tablature",
                  "how to really play", "how to play", "busking", "tutorial"];

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv"];

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
  searchYoutube (track, cb) {
    if (!_gapiLoaded) {
      // store request
      _unprocessedRequests.push([track, cb]);
    } else {
      processRequest(track, cb);
    }
  }
}

function processRequest (track, cb) {
  // get ytid from first valid result
  const cleanTitle = SearchStringUtil.cleanSpotifyTitle(track.title);
  let query = `${track.artist} ${SearchStringUtil.dropStars(cleanTitle)}`;
  console.log(`***Searched YT for: ${query}***`);
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    checkResults(response.items, 0, track.artist, cleanTitle, function (validResult) {
      if (validResult) {
        const ytid = validResult.id.videoId;
        videoDuration(ytid, function (duration) {
          cb(ytid, duration);
        });
      } else {
        console.log(`***Unable to find YT results for query:${query}***`);
      }
    });
  });
}

function checkResults (results, i, artist, trackTitle, cb) {
  if (!results[i]) {
    cb(null);
    return;
  } else {
    validResult(results[i], artist, trackTitle, function (valid) {
      if (valid) {
        cb(results[i]);
      } else {
        checkResults (results, i + 1, artist, trackTitle, cb);
      }
    });
  }
}

function validResult (result, artist, trackTitle, cb) {
  // check for blacklisted channels
  if (REJECTED_CHANNELS.includes(result.snippet.channelTitle.toLowerCase())) {
    cb(false);
    return;
  }

  const resultTitle = result.snippet.title;
  const channelTitle = result.snippet.channelId;
  const artistRegExp = new RegExp(SearchStringUtil.wildCardSpacesAndStars(artist), 'i');
  const trackTitleRegExp = new RegExp(SearchStringUtil.wildCardSpacesAndStars(trackTitle), 'i');

  // title OR channel must match artist AND title must match trackTitle
  if (!(resultTitle.match(artistRegExp) || channelTitle.match(artistRegExp)) ||
        !resultTitle.match(trackTitleRegExp)) {
    cb(false);
    return;
  }
  // can not match any filter words
  for (let i = 0; i < FILTER_WORDS.length; i++) {
    if (resultTitle.match(new RegExp(FILTER_WORDS[i], 'i'))) {
      cb(false);
      return;
    }
  }

  // valid if not restricted
  ageRestricted(result.id.videoId, function (restricted) {
    cb(!restricted);
  });
}

function ageRestricted (ytid, cb) {
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: ytid
  }).execute(function (response) {
    const details = response.items[0].contentDetails;
    if (details.contentRating) {
      cb(details.contentRating.ytRating === "ytAgeRestricted");
    } else {
      cb(false);
    }
  });
}

function videoDuration (ytid, cb) {
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: ytid
  }).execute(function (response) {
    const str = response.items[0].contentDetails.duration;
    const duration = SearchStringUtil.extractDuration(str);
    cb(duration);
  });
}
