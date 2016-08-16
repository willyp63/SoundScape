const SearchStringUtil = require('./search_string_util');
const NODE_SERVER_URL = 'thawing-bastion-97540.herokuapp.com';

const MAX_REQUESTS_OUT = 5;
const MAX_ITEMS = 40;

// SCORES CONSTS
const AUTO_PASS_SCORE = 2.65;
const ACCEPTABLE_SCORE = 1.35;

// ANY DURATION OFFSET LESS WILL SCORE 0.0
const MAX_DURATION_OFFSET = 45;

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv", "anderxv nightcore"];

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke", "remix",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar", "mix",
                  "ukulele", "drum", "piano", "tablature", "lesson", "version",
                  "how to really play", "how to play", "busking", "tutorial", "rehearsal"];

const Searcher = function (track, options) {
  this.track = track;
  this.options = options;
  this.trackTitleWordRegExps = SearchStringUtil.titleWordRegExps(track.title);
  this.trackArtistRegExps = SearchStringUtil.artistRegExps(track.artists);
};

Searcher.prototype.search = function (foundResult) {
  this.foundResult = foundResult;
  this.getItems(function () {
    // fire off initial round of scoring requests
    this.callBacksWaiting = 0;
    this.doneSearching = false;
    for (let i = 0; i < MAX_REQUESTS_OUT; i++) {
      this.nextItem();
    }
  }.bind(this));
};

Searcher.prototype.getItems = function (hasItems) {
  // search YT for video items matching the track
  const query = SearchStringUtil.formatQuery(this.track);
  if (this.options.logs) {
    console.log('#############');
    console.log(`???Starting Search for Query: (${query})`);
    console.log('#############');
  }
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: MAX_ITEMS
  }).execute(function (response) {
    this.items = response.items;
    this.idx = 0;
    this.scores = {};
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
  if (!item) { this.doneSearching = true; return; }

  // init score object
  const score = {failMessage: null, titleScore: 0.0, artistScore: 0.0, durationScore: 0.0};
  this.scores[item.id.videoId] = score;

  // black/white checks
  if (this.badYtid(item, score) ||
      this.rejectedChannel(item, score) ||
      this.hasFilterWord(item, score)) {
        // fire next scoring request right away
        this.nextItem();
  } else {
    // score title and artists
    score.titleScore = this.scoreTitle(item);
    score.artistScore = this.scoreArtists(item);

    // make API calls and increment/decrement counter
    this.callBacksWaiting++;
    makeRemoteCalls(item, function (duration, restricted, validFormat) {
      this.callBacksWaiting--;

      // black/white checks
      if (restricted) {
        score.failMessage = 'RESTRICTED';
      } else if (!validFormat) {
        score.failMessage = 'INVALID FORMAT';
      } else {
        // score duration
        score.durationScore = this.scoreDuration(duration);

        // stop search if auto pass
        if (score.titleScore + score.artistScore + score.durationScore >= AUTO_PASS_SCORE) {
          this.doneSearching = true;
        }
      }
      // fire next scoring request after API calls
      this.nextItem();
    }.bind(this));
  }
};

Searcher.prototype.returnBestItem = function () {
  // get best scored item
  let bestItem, bestScore, bestI;
  for (let i = 0; i < Math.min(this.idx, this.items.length); i++) {
    const item = this.items[i];
    const score = this.scores[item.id.videoId];
    if (!score) { break; }
    const totalScore = score.titleScore + score.artistScore + score.durationScore;
    if (!bestScore || totalScore > bestScore) {
      bestItem = item;
      bestScore = totalScore;
      bestI = i;
    }
    if (this.options.logs) { this.logScore(i); }
  }
  // return item if acceptable
  if (bestScore >= ACCEPTABLE_SCORE) {
    if (this.options.logs) { console.log(`???Returned Result #${bestI}???`); }
    this.foundResult(bestItem);
  } else {
    if (this.options.logs) { console.log(`???Returned NULL???`); }
    this.foundResult(null);
  }
};

Searcher.prototype.logScore = function (i) {
  const item = this.items[i];
  const score = this.scores[item.id.videoId];
  console.log(`ITEM #${i}: (${item.snippet.title})`);
  if (score.failMessage) {
    console.log(`Failed b/c: ${score.failMessage}`);
  } else {
    console.log(`TitleScore: ${score.titleScore}`);
    console.log(`ArtistScore: ${score.artistScore}`);
    console.log(`DurationScore: ${score.durationScore}`);
    console.log(`TotalScore: ${score.titleScore + score.artistScore + score.durationScore}`);
  }
  console.log('#############');
};

// BLACK/WHITE CHECKS
Searcher.prototype.badYtid = function (item, score) {
  const batId = (!item.id.videoId || this.options['blacklistIds'].includes(item.id.videoId));
  if (batId) { score.failMessage = 'BAD YTID!'; }
  return batId;
};

Searcher.prototype.rejectedChannel = function (item, score) {
  const rejectChannel = REJECTED_CHANNELS.includes(item.snippet.channelTitle.toLowerCase());
  if (rejectChannel) { score.failMessage = 'REJECTED CHANNEL!'; }
  return rejectChannel;
};

Searcher.prototype.hasFilterWord = function (item, score) {
  const itemTitle = item.snippet.title;
  const trackTitle = this.track.title;
  for (let i = 0; i < FILTER_WORDS.length; i++) {
    const filterRegExp = new RegExp(FILTER_WORDS[i], 'i');
    // filter word is not in track title but is in item title
    if (!trackTitle.match(filterRegExp) && itemTitle.match(filterRegExp)) {
      score.failMessage = `HAS FILTER WORD: ${FILTER_WORDS[i]}!`;
      return true;
    }
  }
  return false;
};

// SCORING
Searcher.prototype.scoreTitle = function (item) {
  const itemTitle = item.snippet.title;
  let score = 0.0;
  this.trackTitleWordRegExps.forEach(wordRegExp => {
    if (itemTitle.match(wordRegExp)) {
      score += 1.0 / this.trackTitleWordRegExps.length;
    }
  });
  return score;
};

Searcher.prototype.scoreArtists = function (item) {
  // 1.0/(number of artists) points for each matching artist
  const itemTitle = item.snippet.title;
  const channelTitle = item.snippet.channelTitle;
  for (let i = 0; i < this.trackArtistRegExps.length; i++) {
    const factor = 1.0 / (i + 1);
    const nextFactor = 1.0 / (i + 2);
    const artistRegExps = this.trackArtistRegExps[i];
    const score = this.scoreArtist(itemTitle, channelTitle, artistRegExps);
    if (score * factor >= 1.0 * nextFactor) {
      return score;
    }
  }
  return 0.0;
};

Searcher.prototype.scoreArtist = function (itemTitle, channelTitle, artistRegExps) {
  let score = 0.0;
  for (let i = 0; i < artistRegExps.length; i++) {
    const artistRegExp = artistRegExps[i];
    if (itemTitle.match(artistRegExp) || channelTitle.match(artistRegExp)) {
      score += 1.0 / artistRegExps.length;
    }
  }
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
