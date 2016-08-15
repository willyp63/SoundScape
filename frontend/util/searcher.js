const SearchStringUtil = require('./search_string_util');

const AUTO_PASS_SCORE = 2.65;
const ACCEPTABLE_SCORE = 1.35;

const MAX_DURATION_OFFSET = 90;

const MAX_REQUESTS_OUT = 5;

const NODE_SERVER_URL = 'thawing-bastion-97540.herokuapp.com';

const REJECTED_CHANNELS = ["gabriella9797", "guitarlessons365song",
                        "mathieu terrade", "rock class 101", "ole's music",
                        "cifra club", "justinguitar songs", "the beatles", "bbc radio 1",
                      "hollywiretv"];

const FILTER_WORDS = ["live", "cover", "parody", "parodie", "karaoke", "remix",
                  "full album", "español", "concert", "tutorial", "mashup",
                  "acoustic", "instrumental", "karaote", "guitar lesson",
                  "ukulele lesson", "drum lesson", "piano lesson", "tablature",
                  "how to really play", "how to play", "busking", "tutorial", "rehearsal"];

const Searcher = function (items, track, options) {
  this.items = items;
  this.track = track;
  this.options = options;
  this.trackTitleRegExp = titleRegExp(track.title);
  this.trackArtistRegExps = artistRegExps(track.artists);
  this.scores = {};
  this.callBacksWaiting = 0;
  this.doneSearching = false;
  this.idx = 0;
};

Searcher.prototype.search = function (foundResult) {
  this.foundResult = foundResult;
  for (let i = 0; i < MAX_REQUESTS_OUT; i++) {
    this.scoreItem();
  }
};

Searcher.prototype.scoreItem = function () {
  const item = this.items[this.idx++];
  if (!item) {
    this.idx = this.items.length;
    this.doneSearching = true;
    return;
  }

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
    let score = 0.0;
    const titleScore = this.scoreTitle(item);
    const artistsScore = this.scoreArtists(item);
    score += titleScore;
    score += artistsScore;
    if (this.options.logs) { console.log(`(${item.snippet.title}) TITLE_SCORE: ${titleScore}`); }
    if (this.options.logs) { console.log(`(${item.snippet.title}) ARTISTS_SCORE: ${artistsScore}`); }

    this.callBacksWaiting++;
    makeRemoteCalls(item, function (duration, restricted, validFormat) {
      this.callBacksWaiting--;

      if (restricted) {
        if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: restricted`); }
        this.scores[item.id.videoId] = -1.0;
      } else if (!validFormat) {
        if (this.options.logs) { console.log(`(${item.snippet.title}) FAILED B/C:: invalidFormat`); }
        this.scores[item.id.videoId] = -1.0;
      } else {
        const durationScore = this.scoreDuration(duration);
        if (this.options.logs) { console.log(`(${item.snippet.title}) DURATION_SCORE: ${durationScore}`); }
        score += durationScore;
        this.scores[item.id.videoId] = score;

        if (score >= AUTO_PASS_SCORE) {
          this.doneSearching = true;
        }
      }
      this.nextItem();
    }.bind(this));
  }
};

Searcher.prototype.nextItem = function () {
  if (this.doneSearching) {
    if (!this.callBacksWaiting) {
      this.returnBestItem();
    }
  } else {
    this.scoreItem();
  }
};

Searcher.prototype.returnBestItem = function () {
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
  if (bestScore >= ACCEPTABLE_SCORE) {
    this.foundResult(bestItem);
  } else {
    this.foundResult(null);
  }
};

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

Searcher.prototype.scoreTitle = function (item) {
  const itemTitle = item.snippet.title;
  if (itemTitle.match(this.trackTitleRegExp)) {
    return 1.0;
  } else {
    return 0.0;
  }
};

Searcher.prototype.scoreArtists = function (item) {
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
  const diff = Math.abs(this.track.duration_sec - duration);
  let score = (MAX_DURATION_OFFSET - diff) / MAX_DURATION_OFFSET;
  if (score < 0) { score = 0; }
  return score;
};

module.exports = Searcher;

function titleRegExp (trackTitle) {
  let str = SearchStringUtil.cleanSpotifyTitle(trackTitle);
  str = SearchStringUtil.dropLeadingWords(str);
  str = SearchStringUtil.formatForRegExp(str);
  return new RegExp(str, 'i');
}

function artistRegExps (artists) {
  return artists.map(artist => {
    let str = SearchStringUtil.dropLeadingWords(artist);
    str = SearchStringUtil.formatForRegExp(str);
    return new RegExp(str, 'i');
  });
}

function makeRemoteCalls (item, cb) {
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
  checkAudioFormat(item, function (validFormat) {
    callsReturned++;
    _validFormat = validFormat;
    if (callsReturned >= 2) {
      cb(_duration, _restricted, _validFormat);
    }
  });
}

function getYtInfo (item, cb) {
  gapi.client.youtube.videos.list({
    part: 'contentDetails', id: item.id.videoId
  }).execute(function (response) {
    const details = response.items[0].contentDetails;
    const duration = SearchStringUtil.extractDuration(details.duration);
    const restricted = (details.contentRating && details.contentRating.ytRating === "ytAgeRestricted");
    cb(duration, restricted);
  });
}

function checkAudioFormat (item, cb) {
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
