const SearchStringUtil = require('./search_string_util');

const STREAMING_URL = 'thawing-bastion-97540.herokuapp.com';

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson", "tablature",
                  "how to really play", "how to play", "busking", "tutorial", "rehearsal"];

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv"];

const TIME_DEVIATION = 40;

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
      processRequest(request[0], request[1], request[2]);
    });
    _unprocessedRequests = [];
  });
};

// EXPORTS
module.exports = {
  searchYoutube (track, options, cb) {
    if (!_gapiLoaded) {
      // store request
      _unprocessedRequests.push([track, options, cb]);
    } else {
      processRequest(track, options, cb);
    }
  }
};

function processRequest (track, options, cb) {
  // check if server has ytid
  $.ajax({
    url: `http://${STREAMING_URL}/ytid/${track.spotify_id}`,
    method: 'GET',
    dataType: 'JSON',
    success (response) {
      if (response.ytid && !options['blacklistIds'].includes(response.ytid)) {
        cb(response.ytid);
      } else {
        searchTrack(track, options, cb);
      }
    }
  });
}

function searchTrack (track, options, cb) {
  const cleanTitle = SearchStringUtil.cleanSpotifyTitle(track.title);
  let query = `${SearchStringUtil.replaceAnds(track.artists[0])} ${SearchStringUtil.dropStars(cleanTitle)}`;
  console.log(`???Searching YT for: ${query}???`);
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    checkResults(response.items, options, 0, track.artists, cleanTitle, track.duration_sec, function (validResult) {
      if (validResult) {
        const ytid = validResult.id.videoId;
        console.log(`???Found Valid Result:${validResult.snippet.title}???`);
        cb(ytid);

        // cache ytid in server
        $.ajax({
          url: `http://${STREAMING_URL}/cache?ytid=${ytid}&spotifyId=${track.spotify_id}`,
          method: 'GET'
        });
      } else {
        console.log(`!!!No Valid Results!!!`);
        cb(null);
      }
    });
  });
}

function checkResults (results, options, i, artists, trackTitle, trackDuration, cb) {
  // check each result sequentially
  if (!results[i]) {
    cb(null);
    return;
  } else {
    console.log(`?Checking Result:${results[i].snippet.title}?`);
    validResult(results[i], options, artists, trackTitle, trackDuration, function (valid) {
      if (valid) {
        cb(results[i]);
      } else {
        checkResults(results, options, i + 1, artists, trackTitle, trackDuration, cb);
      }
    });
  }
}

function validResult (result, options, artists, trackTitle, trackDuration, cb) {
  // check for videoId
  if (!result.id.videoId || options['blacklistIds'].includes(result.id.videoId)) {
    console.log(`!Result:${result.snippet.title} Invalid b/c Invalid YTID!`);
    cb(false);
    return;
  }

  // check for blacklisted channels
  if (REJECTED_CHANNELS.includes(result.snippet.channelTitle.toLowerCase())) {
    console.log(`!Result:${result.snippet.title} Invalid b/c Rejected Channel!`);
    cb(false);
    return;
  }

  // title OR channel must match artist AND title must match trackTitle
  const resultTitle = result.snippet.title;
  const channelTitle = result.snippet.channelTitle;
  let artistMatch = false;
  for (var i = 0; i < artists.length; i++) {
    const artistRegExp = new RegExp(SearchStringUtil.wildCardSpacesAndStars(SearchStringUtil.replaceAnds(artists[i])), 'i');
    if (resultTitle.match(artistRegExp) || channelTitle.match(artistRegExp)) {
      artistMatch = true;
      break;
    }
  }
  const trackTitleRegExp = new RegExp(SearchStringUtil.wildCardSpacesAndStars(trackTitle), 'i');
  if (!artistMatch || !resultTitle.match(trackTitleRegExp)) {
    console.log(`!Result:${result.snippet.title} Invalid b/c Title/Artist Match!`);
    cb(false);
    return;
  }

  // can not match any filter words
  for (let i = 0; i < FILTER_WORDS.length; i++) {
    const filterRegExp = new RegExp(FILTER_WORDS[i], 'i');
    if (!trackTitle.match(filterRegExp) && resultTitle.match(filterRegExp)) {
      console.log(`!Result:${result.snippet.title} Invalid b/c Filter Words (${FILTER_WORDS[i]})!`);
      cb(false);
      return;
    }
  }

  getYtInfo(result.id.videoId, function (duration, restricted) {
    // valid if not restricted
    if (restricted) {
      console.log(`!Result:${result.snippet.title} Invalid b/c Age Restriction!`);
      cb(false);
      return;
    }

    // valid if within time deviation
    if (trackDuration < duration - TIME_DEVIATION || trackDuration > duration + TIME_DEVIATION) {
      console.log(`!Result:${result.snippet.title} Invalid b/c Time Deviation!`);
      cb(false);
      return;
    }

    // audio format must be 'opus'
    validAudioFormat(result.id.videoId, function (validFormat) {
      if (!validFormat) {
        console.log(`!Result:${result.snippet.title} Invalid b/c Audio Format!`);
      }
      cb(validFormat);
    });
  });
}

function getYtInfo (ytid, cb) {
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: ytid
  }).execute(function (response) {
    const details = response.items[0].contentDetails;
    const duration = SearchStringUtil.extractDuration(details.duration);
    const restricted = (details.contentRating && details.contentRating.ytRating === "ytAgeRestricted");
    cb(duration, restricted);
  });
}

function validAudioFormat (ytid, cb) {
  $.ajax({
    url: `http://${STREAMING_URL}/audioEncoding/${ytid}`,
    method: 'GET',
    dataType: 'JSON',
    success (response) {
      cb(response.validFormat);
    },
    error (err) {
      cb(false);
    }
  });
}
