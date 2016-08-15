const SearchStringUtil = require('./search_string_util');
const NODE_SERVER_URL = 'thawing-bastion-97540.herokuapp.com';

const MAX_REQUESTS_OUT = 5;
const MAX_ITEMS = 40;

// SCORES CONSTS
const AUTO_PASS_SCORE = 2.65;
const ACCEPTABLE_SCORE = 1.35;

// ANY DURATION OFFSET LESS WILL SCORE 0.0
const MAX_DURATION_OFFSET = 90;

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv"];

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke", "remix",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson", "tablature",
                  "how to really play", "how to play", "busking", "tutorial", "rehearsal"];

const Searcher = function (track, options) {
  this.track = track;
  this.trackTitleRegExp = SearchStringUtil.titleRegExp(track.title);
  this.trackArtistRegExps = SearchStringUtil.artistRegExps(track.artists);
  this.options = options;
  this.scores = {};
  this.idx = 0;
  this.callBacksWaiting = 0;
  this.doneSearching = false;
};

Searcher.prototype.search = function (foundResult) {
  this.foundResult = foundResult;
  this.getItems(function () {
    // fire off initial round of scoring requests
    for (let i = 0; i < MAX_REQUESTS_OUT; i++) {
      this.nextItem();
    }
  }.bind(this));
};

Searcher.prototype.getItems = function (hasItems) {
  // search YT for video items matching the track
  gapi.client.youtube.search.list({
    part: 'snippet', q: SearchStringUtil.formatQuery(this.track), maxResults: MAX_ITEMS
  }).execute(function (response) {
    this.items = response.items;
    hasItems();
  }.bind(this));
};

Searcher.prototype.nextItem = function () {
  if (this.doneSearching) {
    // return best video if all API calls are back
    if (!this.callBacksWaiting) {
      this.returnBestItem();
    }
  } else {
    this.scoreItem();
  }
};

Searcher.prototype.scoreItem = function () {
  const item = this.items[this.idx++];

  // stop search if out of items
  if (!item) {
    this.idx = this.items.length;
    this.doneSearching = true;
    return;
  }

  // return -1.0 if any black/white check fails
  if (this.badYtid(item)){
    if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: badYtid`); }
    this.scores[item.id.videoId] = -1.0;
    this.nextItem();
  } else if (this.rejectedChannel(item)) {
    if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C: rejectedChannel`); }
    this.scores[item.id.videoId] = -1.0;
    this.nextItem();
  } else if (this.hasFilterWord(item)) {
    if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: hasFilterWord`); }
    this.scores[item.id.videoId] = -1.0;
    this.nextItem();
  } else {
    // score title and artists
    let score = 0.0;
    const titleScore = this.scoreTitle(item);
    const artistsScore = this.scoreArtists(item);
    score += titleScore;
    score += artistsScore;
    if (this.options.logs) { console.log(`(${item.snippet.title}) TITLE_SCORE: ${titleScore}`); }
    if (this.options.logs) { console.log(`(${item.snippet.title}) ARTISTS_SCORE: ${artistsScore}`); }

    // make API requests and increment/decrement counter
    this.callBacksWaiting++;
    makeRemoteCalls(item, function (duration, restricted, validFormat) {
      this.callBacksWaiting--;

      // return -1.0 if any black/white check fails
      if (restricted) {
        if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: restricted`); }
        this.scores[item.id.videoId] = -1.0;
      } else if (!validFormat) {
        if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: invalidFormat`); }
        this.scores[item.id.videoId] = -1.0;
      } else {
        // score duration and then save score
        const durationScore = this.scoreDuration(duration);
        if (this.options.logs) { console.log(`(${item.snippet.title}) DURATION_SCORE: ${durationScore}`); }
        score += durationScore;
        this.scores[item.id.videoId] = score;

        // stop search if auto pass
        if (score >= AUTO_PASS_SCORE) {
          this.doneSearching = true;
        }
      }
      // fire next scoring request
      this.nextItem();
    }.bind(this));
  }
};

Searcher.prototype.returnBestItem = function () {
  // get best scored item
  let bestItem, bestScore;
  for (let i = 0; i < this.idx; i++) {
    const item = this.items[i];
    const score = this.scores[item.id.videoId];
    if (this.options.logs) { console.log(`Item#${i} (${item.snippet.title}): ${score}`); }
    if (!bestScore || score > bestScore) {
      bestItem = item;
      bestScore = score;
    }
  }
  // return item if acceptable
  if (bestScore >= ACCEPTABLE_SCORE) {
    this.foundResult(bestItem);
  } else {
    this.foundResult(null);
  }
};

// BLACK/WHITE CHECKS
Searcher.prototype.badYtid = function (item) {
  return (!item.id.videoId || this.options['blacklistIds'].includes(item.id.videoId));
};

Searcher.prototype.rejectedChannel = function (item) {
  return REJECTED_CHANNELS.includes(item.snippet.channelTitle.toLowerCase());
};

Searcher.prototype.hasFilterWord = function (item) {
  const itemTitle = item.snippet.title;
  const trackTitle = this.track.title;
  for (let i = 0; i < FILTER_WORDS.length; i++) {
    const filterRegExp = new RegExp(FILTER_WORDS[i], 'i');
    // filter word is not in track title but is in item title
    if (!trackTitle.match(filterRegExp) && itemTitle.match(filterRegExp)) {
      return true;
    }
  }
  return false;
};

// SCORING
Searcher.prototype.scoreTitle = function (item) {
  const itemTitle = item.snippet.title;
  if (itemTitle.match(this.trackTitleRegExp)) {
    return 1.0;
  } else {
    return 0.0;
  }
};

Searcher.prototype.scoreArtists = function (item) {
  // 1.0/(number of artists) points for each matching artist
  const itemTitle = item.snippet.title;
  const channelTitle = item.snippet.channelTitle;
  let score = 0.0;
  this.trackArtistRegExps.forEach(artistRegExp => {
    if (itemTitle.match(artistRegExp) || channelTitle.match(artistRegExp)) {
      score += 1.0 / this.trackArtistRegExps.length;
    }
  });
  return score;
};

Searcher.prototype.scoreDuration = function (duration) {
  // 0.0 to 1.0 scale (anything off by more than MAX_DURATION_OFFSET is 0.0)
  const diff = Math.abs(this.track.duration_sec - duration);
  let score = (MAX_DURATION_OFFSET - diff) / MAX_DURATION_OFFSET;
  if (score < 0) { score = 0; }
  return score;
};

// EXPORTS
module.exports = Searcher;

// API CALLS
function makeRemoteCalls (item, cb) {
  // make both API calls and then callback after both have returned
  let callsReturned = 0;
  let _duration, _restricted, _validFormat;
  getYtInfo(item, function (duration, restricted) {
    callsReturned++;
    _duration = duration;
    _restricted = restricted;
    if (callsReturned >= 2) {
      cb(_duration, _restricted, _validFormat);
    }
  });
  getAudioFormat(item, function (validFormat) {
    callsReturned++;
    _validFormat = validFormat;
    if (callsReturned >= 2) {
      cb(_duration, _restricted, _validFormat);
    }
  });
}

function getYtInfo (item, cb) {
  // return duration and age-restriction from YT
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: item.id.videoId
  }).execute(function (response) {
    const details = response.items[0].contentDetails;
    const duration = SearchStringUtil.extractDuration(details.duration);
    const restricted = (details.contentRating && details.contentRating.ytRating === "ytAgeRestricted");
    cb(duration, restricted);
  });
}

function getAudioFormat (item, cb) {
  // return validAudioFormat from Node server
  $.ajax({
    url: `http://${NODE_SERVER_URL}/audioEncoding/${item.id.videoId}`,
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
