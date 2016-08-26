const StringUtil = require('./string_util');
const StringScorer = require('./string_scorer');

const NODE_SERVER_URL = 'thawing-bastion-97540.herokuapp.com';

// REQUEST CONSTS
const MAX_REQUESTS_OUT = 8;
const MAX_ITEMS = 40;

// SCORES CONSTS
const AUTO_PASS_SCORE = 0.942;
const GROUP_AUTO_PASS_SCORE = 0.815;
const AUTO_PASS_GROUP_SIZE = 4;
const ACCEPTABLE_SCORE = 0.357;

// SCORE WEIGHTS
const TITLE_SCORE_WEIGHT = 1.0;
const ARTISTS_SCORE_WEIGHT = 1.0;
const DURATION_SCORE_WEIGHT = 0.66;
const POPULARITY_SCORE_WEIGHT = 0.5;

// min levenstien score for string scoring
const MIN_STRING_SCORE = 0.5;

// ANY DURATION OFFSET LESS WILL SCORE 0.0
const MAX_DURATION_OFFSET = 120;

// FILTER LISTS
const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song", "thedaily411",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv", "anderxv nightcore"];

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke", "remix",
                  "full album", "español", "concert", "tutorial", "mashup", "interview",
                  "acoustic", "instrumental", "karaote", "guitar", "mix", "fitness routine",
                  "ukulele", "drum", "piano", "tablature", "lesson", "version", "pepsi smash",
                  "how to really play", "how to play", "busking", "tutorial", "rehearsal"];

const Searcher = function (track, options) {
  this.track = track;
  this.options = options;
  this.StringScorer = new StringScorer();
  this.idx = 0;
  this.scores = {};
  this.callBacksWaiting = 0;
  this.groupAutoPasses = 0;
  this.doneSearching = this.outOfItems = this.returnedItem = false;

  // calc ahead of time for string comparisons
  this.cleanedTitle = StringUtil.dropPeriods(StringUtil.cleanSpotifyTitle(this.track.title));
  this.numTitleWords = StringUtil.numWords(this.cleanedTitle);
  this.numArtistsWords = this.track.artists.map(artist => StringUtil.numWords(artist));
};

Searcher.prototype.search = function (foundResult) {
  this.foundResult = foundResult;
  this.startTimer(); // start timer for time-stamped logs

  // fetch search results from YT
  this.fetchYtResults(function (items) {
    this.items = items;
    // fire off initial round of scoring requests
    for (let i = 0; i < MAX_REQUESTS_OUT; i++) { this.nextItem(); }
  }.bind(this));
};

Searcher.prototype.fetchYtResults = function (returnResults) {
  // search YT for video items matching the track
  const query = StringUtil.formatQuery(this.track);
  if (this.options.logs) {
    console.log('#############');
    console.log(`???Getting Items for Query: (${query}) @${this.timeDiff()}s`);
    console.log('#############');
  }
  gapi.client.youtube.search.list({
    part: 'snippet', q: query, maxResults: MAX_ITEMS
  }).execute(function (response) {
    if (this.options.logs) {
      console.log('#############');
      console.log(`???Received Items @${this.timeDiff()}s`);
      console.log('#############');
    }
    returnResults(response.items);
  }.bind(this));
};

Searcher.prototype.nextItem = function () {
  if (this.doneSearching) {
    // return imediately
    if (!this.returnedItem) {
      this.returnBestItem();
    }
  } else if (this.outOfItems) {
    // return only after all calls have returned
    if (!this.returnedItem && !this.callBacksWaiting) {
      this.returnBestItem();
    }
  } else {
    this.scoreItem();
  }
};

Searcher.prototype.scoreItem = function () {
  const i = this.idx;
  const item = this.items[this.idx++];

  // stop search if out of items
  if (!item) {
    if (this.options.logs) { console.log(`!!!Stopping Search b/c: Out of Items @${this.timeDiff()}s!!!`); }
    this.outOfItems = true;
    this.nextItem();
    return;
  }

  // init score object
  const score = {failMessage: null, titleScore: 0.0, popularityScore: 0.0,
                artistScore: 0.0, durationScore: 0.0, totalScore: 0.0};

  // black/white checks (pass score so check can set failMessage)
  if (this.badYtid(item, score) ||
      this.rejectedChannel(item, score) ||
      this.hasFilterWord(item, score)) {
        if (this.options.logs) { console.log(`***Item #${i} Failed b/c: ${score.failMessage} @${this.timeDiff()}s***`); }
        this.recordScore(item, score);
        // fire next scoring request right away
        this.nextItem();
  } else {
    // make API calls and increment/decrement counter
    if (this.options.logs) { console.log(`***Making Remote Calls for Item #${i} @${this.timeDiff()}s***`); }
    this.callBacksWaiting++;
    makeApiRequests(item, function (duration, restricted, validFormat) {
      if (this.options.logs) { console.log(`***Received Remote Response for Item #${i} @${this.timeDiff()}s***`); }
      this.callBacksWaiting--;

      // dont bother calculating score if done searching
      if (this.doneSearching) { return; }

      // black/white checks (set failMessage and reset artist/title score)
      if (restricted || !validFormat) {
        score.failMessage = (restricted ? 'RESTRICTED' : 'INVALID FORMAT');
        this.recordScore(item, score);
      } else {
        // score title, artists, duration and total score
        score.titleScore = this.scoreTitle(item);
        score.artistScore = this.scoreArtists(item);
        score.durationScore = this.scoreDuration(duration);
        score.popularityScore = this.scorePopularity(i);
        score.totalScore = this.totalScore(score);
        this.recordScore(item, score);

        // stop search if auto pass
        if (!this.doneSearching) {
          if (score.totalScore >= AUTO_PASS_SCORE) {
            if (this.options.logs) { console.log(`!!!Stopping Search b/c: Auto Pass Score @${this.timeDiff()}s!!!`); }
            this.doneSearching = true;
          } else if (score.totalScore >= GROUP_AUTO_PASS_SCORE) {
            this.groupAutoPasses++;
            if (this.groupAutoPasses >= AUTO_PASS_GROUP_SIZE) {
              if (this.options.logs) { console.log(`!!!Stopping Search b/c: Group Auto Pass @${this.timeDiff()}s!!!`); }
              this.doneSearching = true;
            }
          }
        }
      }

      // fire next scoring request after API calls
      this.nextItem();
    }.bind(this));
  }
};

Searcher.prototype.returnBestItem = function () {
  this.returnedItem = true;

  // get best scored item
  let bestItem, bestScore, bestI;
  for (let i = 0; i < Math.min(this.items.length, this.idx); i++) {
    const item = this.items[i];
    const score = this.scores[item.id.videoId];
    if (!score) { continue; }
    if (!bestScore || score.totalScore > bestScore) {
      bestItem = item;
      bestScore = score.totalScore;
      bestI = i;
    }
    if (this.options.logs) { this.logScore(i); }
  }

  // return item if acceptable
  if (bestScore >= ACCEPTABLE_SCORE) {
    if (this.options.logs) { console.log(`???Returned Result #${bestI} @${this.timeDiff()}s???`); }
    this.foundResult(bestItem);
  } else {
    if (this.options.logs) { console.log(`???Returned NULL @${this.timeDiff()}s???`); }
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
    console.log(`PopularityScore: ${score.popularityScore}`);
    console.log(`TotalScore: ${score.totalScore}`);
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
  const itemTitle = StringUtil.dropPeriods(StringUtil.removeSeperatorsAndExtraSpaces(item.snippet.title));
  const wordDiff = this.numTitleWords === 1 ? 1 : Math.floor(this.numTitleWords / 2);
  return this.scoreStrings(this.cleanedTitle, this.numTitleWords, itemTitle, wordDiff);
};

Searcher.prototype.scoreArtists = function (item) {
  const itemTitle = StringUtil.dropPeriods(StringUtil.removeSeperatorsAndExtraSpaces(item.snippet.title));
  const channelTitle = StringUtil.dropPeriods(StringUtil.removeSeperatorsAndExtraSpaces(item.snippet.channelTitle));

  let lastScore = 0;
  for (let i = 0; i < this.track.artists.length; i++) {
    const factor = 1.0 / (i + 1); const nextFactor = 1.0 / (i + 2);
    const wordDiff = this.numArtistsWords[i] === 1 ? 1 : Math.floor(this.numArtistsWords[i] / 2);
    let score = factor * Math.max(
      this.scoreStrings(this.track.artists[i], this.numArtistsWords[i], itemTitle, wordDiff),
      this.scoreStrings(this.track.artists[i], this.numArtistsWords[i], channelTitle, wordDiff));
    lastScore = score = Math.max(lastScore, score);
    if (score >= nextFactor) {
      return score;
    }
  }
  return lastScore;
};

Searcher.prototype.scoreStrings = function (baseString, numBaseWords, compString, wordDiff) {
  const indecies = StringUtil.spaceIndecies(compString);
  let bestScore = MIN_STRING_SCORE;
  for (let i = 0, j = numBaseWords - wordDiff; j < indecies.length; i++, j++) {
    for (let k = 0; k < (wordDiff * 2) + 1; k++) {
      if (i === j + k) { continue; }
      if (j + k >= indecies.length) { break; }
      const compI = indecies[i]; const compJ = indecies[j + k] - 1;
      const score = this.StringScorer.scoreStrings(baseString, compString, compI, compJ, bestScore);
      if (score > bestScore) { bestScore = score; }
    }
  }
  bestScore = bestScore - MIN_STRING_SCORE;
  return bestScore > 0.0 ? bestScore / (1 - MIN_STRING_SCORE) : 0.0;
};

Searcher.prototype.scoreDuration = function (duration) {
  const diff = Math.abs(this.track.duration_sec - duration);
  return (MAX_DURATION_OFFSET - diff) / MAX_DURATION_OFFSET;
};

Searcher.prototype.scorePopularity = function (resultIdx) {
  return 1 - (resultIdx / (MAX_ITEMS - 1));
};

Searcher.prototype.totalScore = function (scoreObj) {
  const weightSum = TITLE_SCORE_WEIGHT + ARTISTS_SCORE_WEIGHT +
                    DURATION_SCORE_WEIGHT + POPULARITY_SCORE_WEIGHT;
  return ((scoreObj.titleScore * TITLE_SCORE_WEIGHT) +
         (scoreObj.artistScore * ARTISTS_SCORE_WEIGHT) +
         (scoreObj.durationScore * DURATION_SCORE_WEIGHT) +
         (scoreObj.popularityScore * POPULARITY_SCORE_WEIGHT)) / weightSum;
};

Searcher.prototype.recordScore = function (item, scoreObj) {
  this.scores[item.id.videoId] = scoreObj;
};

// TIMER
Searcher.prototype.startTimer = function () {
  this.startTime = new Date().getTime() / 1000;
};

Searcher.prototype.timeDiff = function () {
  return (new Date().getTime() / 1000) - this.startTime;
};

// EXPORTS
module.exports = Searcher;

// API CALLS
function makeApiRequests (item, cb) {
  // make both API calls and then callback after both have returned
  let _callsReturned = 0;
  let _duration, _restricted, _validFormat;
  const callReturned = function () {
    if (++_callsReturned >= 2) {
      cb(_duration, _restricted, _validFormat);
    }
  };
  getYtInfo(item, function (duration, restricted) {
    _duration = duration; _restricted = restricted;
    callReturned();
  });
  getAudioFormat(item, function (validFormat) {
    _validFormat = validFormat;
    callReturned();
  });
}

function getYtInfo (item, cb) {
  // return duration and age-restriction from YT
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: item.id.videoId
  }).execute(function (response) {
    const details = response.items[0].contentDetails;
    const duration = StringUtil.extractDuration(details.duration);
    const restricted = (details.contentRating && details.contentRating.ytRating === "ytAgeRestricted");
    cb(duration, restricted);
  });
}

function getAudioFormat (item, cb) {
  cb(true);
  // return validAudioFormat from Node server
  // $.ajax({
  //   url: `http://${NODE_SERVER_URL}/audioEncoding/${item.id.videoId}`,
  //   method: 'GET',
  //   dataType: 'JSON',
  //   success (response) { cb(response.validFormat); },
  //   error (err) { cb(false); }
  // });
}
