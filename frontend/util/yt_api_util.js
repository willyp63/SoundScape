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

const TIME_DEVIATION = 20;

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
  let query = `${track.artists[0]} ${SearchStringUtil.dropStars(cleanTitle)}`;
  console.log(`???Searching YT for: ${query}???`);
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: 50
  }).execute(function (response) {
    checkResults(response.items, 0, track.artists, cleanTitle, track.duration_sec, function (validResult) {
      if (validResult) {
        const ytid = validResult.id.videoId;
        console.log(`???Found Valid Result:${validResult.snippet.title}???`);
        cb(ytid);
      } else {
        console.log(`!!!No Valid Results!!!`);
      }
    });
  });
}

function checkResults (results, i, artists, trackTitle, trackDuration, cb) {
  if (!results[i]) {
    cb(null);
    return;
  } else {
    console.log(`?Checking Result:${results[i].snippet.title}?`);
    validResult(results[i], artists, trackTitle, trackDuration, function (valid) {
      if (valid) {
        cb(results[i]);
      } else {
        checkResults(results, i + 1, artists, trackTitle, trackDuration, cb);
      }
    });
  }
}

function validResult (result, artists, trackTitle, trackDuration, cb) {
  // check for videoId
  if (!result.id.videoId) {
    console.log(`!Result:${result.snippet.title} Invalid b/c No YTID!`);
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
    const artistRegExp = new RegExp(SearchStringUtil.wildCardSpacesAndStars(artists[i]), 'i');
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

  // valid if within time deviation
  videoDuration(result.id.videoId, function (duration) {
    if (trackDuration < duration - TIME_DEVIATION || trackDuration > duration + TIME_DEVIATION) {
      console.log(`!Result:${result.snippet.title} Invalid b/c Time Deviation!`);
      cb(false);
      return;
    }

    // valid if not restricted
    ageRestricted(result.id.videoId, function (restricted) {
      if (restricted) {
        console.log(`!Result:${result.snippet.title} Invalid b/c Age Restriction!`);
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

function validAudioFormat (ytid, cb) {
  $.ajax({
    url: `http://thawing-bastion-97540.herokuapp.com/check/${ytid}`,
    method: 'GET',
    dataType: 'JSON',
    success (response) {
      cb(response.validFormat);
    }
  });
}
