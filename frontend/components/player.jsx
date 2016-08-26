const PlayerStore = require('../stores/player_store');
const YtidStore = require('../stores/ytid_store');
const YtActions = require('../actions/yt_actions');
const TrackStore = require('../stores/track_store');
const SessionStore = require('../stores/session_store');
const AudioPlayer = require('../util/audio_player');
const PlayerActions = require('../actions/player_actions');
const ModalActions = require('../actions/modal_actions');
const ErrorActions = require('../actions/error_actions');
const TrackActions = require('../actions/track_actions');
const SearchResult = require('./nav_bar/search_result');
const ReportActions = require('../actions/report_actions');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {tracks: [], playing: false, loadingLike: false, unableToLoadTrack: false,
      loadingTrack: false, currentTime: 0, duration: 0, playIdx: 0, playUrl: null};
  },
  componentWillMount () {
    _listeners.push(PlayerStore.addListener(this._onChange));
    _listeners.push(YtidStore.addListener(this._onYtid));
    _listeners.push(TrackStore.addListener(this._trackChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange () {
    if (PlayerStore.newTracks()) {
      this.setState({tracks: PlayerStore.tracks(), playIdx: 0}, this._tryToPlayAudio);
    } else {
      this.setState({tracks: PlayerStore.tracks(), loadingLike: false});
    }
  },
  _trackChange () {
    this.setState({loadingLike: false});
  },
  _onYtid () {
    if (!this.state.playing) {
      this._tryToPlayAudio();
    }
  },
  _tryToPlayAudio () {
    AudioPlayer.removeListeners();
    const playTrack = this.state.tracks[this.state.playIdx];
    if (!playTrack) { return; }
    if (playTrack.audio_url || YtidStore.hasId(playTrack)) {
      if (YtidStore.getId(playTrack) === 'NOT_FOUND') {
        takeDownSpinner();
        this.setState({playing: false, loadingTrack: true, playUrl: null, unableToLoadTrack: true});
      } else {
        this.setState({playing: false, loadingTrack: true, playUrl: YtidStore.getUrl(playTrack)}, this._beginPlaying);
      }
      let nextIdx = this.state.playIdx + 1;
      if (nextIdx >= this.state.tracks.length) { nextIdx = 0; }
      const nextTrack = this.state.tracks[nextIdx];
      if (!nextTrack.audio_url && !YtidStore.hasId(nextTrack)) {
        if (nextTrack.reported) {
          YtActions.searchYoutube(nextTrack, {'blacklistIds': [], 'logs': true});
        } else {
          YtActions.searchYoutube(nextTrack);
        }
      }
    } else {
      this.setState({playing: false, loadingTrack: true, playUrl: null, unableToLoadTrack: false}, this._fetchAudio);
    }
  },
  _fetchAudio () {
    setupSpinner();
    const playTrack = this.state.tracks[this.state.playIdx];
    if (playTrack.reported) {
      YtActions.searchYoutube(playTrack, {'blacklistIds': [], 'logs': true});
    } else {
      YtActions.searchYoutube(playTrack);
    }
  },
  _beginPlaying () {
    initVolume();
    setupSpinner();
    AudioPlayer.moveProgressHead(0);
    this.setState({currentTime: 0}, function () {
      AudioPlayer.init(this._onLoad, this._timeUpdate, this._onEnd);
    });
  },
  _onLoad () {
    this.setState({duration: AudioPlayer.duration(), loadingTrack: false, playing: true}, function () {
      takeDownSpinner();
      AudioPlayer.play();
    });
  },
  _timeUpdate () {
    AudioPlayer.timeUpdate();
    this.setState({currentTime: AudioPlayer.currentTime()});
  },
  _onEnd () {
    this._nextTrack();
  },
  _togglePlay () {
    if (this.state.loadingTrack) { return; }
    this.state.playing ? AudioPlayer.pause() : AudioPlayer.play();
    this.setState({playing: !this.state.playing});
  },
  _clickProgressBar (e) {
    const percent = mousePercentProgressBar(e);
    AudioPlayer.setCurrentTime(percent);
    AudioPlayer.moveProgressHead(percent);
  },
  _clickProgressHead (e) {
    AudioPlayer.stopUpdating();
    $(window).on('mousemove', moveProgressHead);
    $(window).on('mouseup', progressHeadReleased);
  },
  _toggleVolumeSelector (e) {
    e.stopPropagation();
    const volumeSelector = $('.volume-selector');
    if (volumeSelector.css('display') === 'none') {
      volumeSelector.css('display', 'block');
    } else {
      volumeSelector.css('display', 'none');
    }
  },
  _toggleQueue (e) {
    e.stopPropagation();
    const queue = $('.track-queue');
    if (queue.css('display') === 'none') {
      queue.css('display', 'block');
    } else {
      queue.css('display', 'none');
    }
  },
  _clickVolumeBar (e) {
    e.stopPropagation();
    const percent = mousePercentVolumeBar(e);
    setVolume(percent);
  },
  _clickVolumeHead (e) {
    e.stopPropagation();
    $(window).on('mousemove', moveVolumeHead);
    $(window).on('mouseup', volumeHeadReleased);
  },
  _removeTrack (track) {
    const playTrack = this.state.tracks[this.state.playIdx];
    PlayerActions.removePlayingTrack(track);
    if (track.storeId === playTrack.storeId) {
      AudioPlayer.removeListeners();
      let nextIdx = this.state.playIdx;
      if (nextIdx >= this.state.tracks.length - 1) { nextIdx = 0; }
      this.setState({playIdx: nextIdx}, this._tryToPlayAudio);
    } else {
      const idx = this.state.tracks.indexOf(track);
      if (idx < this.state.playIdx) {
        this.setState({playIdx: this.state.playIdx - 1});
      }
    }
  },
  _nextTrack () {
    let nextIdx = this.state.playIdx + 1;
    if (nextIdx >= this.state.tracks.length) { nextIdx = 0; }
    this.setState({playIdx: nextIdx}, this._tryToPlayAudio);
  },
  _previousTrack () {
    let nextIdx = this.state.playIdx - 1;
    if (nextIdx < 0) { nextIdx = this.state.tracks.length - 1; }
    this.setState({playIdx: nextIdx}, this._tryToPlayAudio);
  },
  _playTrack (track) {
    let nextIdx = this.state.tracks.indexOf(track);
    if (nextIdx < 0) { return; }
    this.setState({playIdx: nextIdx}, this._tryToPlayAudio);
  },
  _closePlayer () {
    AudioPlayer.removeListeners();
    PlayerActions.closePlayer();
  },
  _likeTrack () {
    if (!SessionStore.loggedIn()) {
      ErrorActions.removeErrors();
      ModalActions.show("USER", "SIGNUP");
    } else {
      const track = this.state.tracks[this.state.playIdx];
      this.setState({loadingLike: true});
      if (track.liked) {
        if (TrackStore.indexType() === "MY_LIKES") {
          TrackActions.unlikeAndRemoveTrack(track);
        } else {
          TrackActions.unlikeTrack(track);
        }
      } else {
        if (typeof track.id === 'string') {
          TrackActions.postAndLikeTrack(track);
        } else {
          TrackActions.likeTrack(track);
        }
      }
    }
  },
  _retrySearch () {
    AudioPlayer.removeListeners();

    const playTrack = this.state.tracks[this.state.playIdx];
    const oldYtid = YtidStore.getId(playTrack);
    YtActions.blacklistId(playTrack, oldYtid);

    ReportActions.reportTrack(playTrack);

    this.setState({playing: false, loadingTrack: true, playUrl: null, unableToLoadTrack: false}, function () {
      setupSpinner();
      if (playTrack.reported) {
        YtActions.searchYoutube(playTrack, {'blacklistIds': YtidStore.getBlacklist(playTrack), 'logs': true});
      } else {
        YtActions.searchYoutube(playTrack, {'blacklistIds': YtidStore.getBlacklist(playTrack)});
      }
    });
  },
  render () {
    const track = this.state.tracks[this.state.playIdx];
    return (
      <div>{
        track ?
          <nav className="audio-player-bar">
            {this.state.playUrl ?
              <audio controls preload="none" autoplay id="audio-player">
                <source src={track.audio_url || this.state.playUrl} type="audio/mpeg"/>
              </audio> : ""}
            <div className="playing-image">
              <i className="glyphicon glyphicon-remove" onClick={this._closePlayer}/>
              {this.state.loadingTrack ?
                <div className="retry-button-container">
                  <div className="retry-button disabled">
                    RETRY
                  </div>
                </div> :
                <div className="retry-button-container">
                  <div className="retry-button" onClick={this._retrySearch}>
                    RETRY
                  </div>
                </div>}
              <div className="player-like-button" onClick={this._likeTrack}>
                {this.state.loadingLike ?
                  <div className="sk-fading-circle">
                    <div className="sk-circle1 sk-circle"></div>
                    <div className="sk-circle2 sk-circle"></div>
                    <div className="sk-circle3 sk-circle"></div>
                    <div className="sk-circle4 sk-circle"></div>
                    <div className="sk-circle5 sk-circle"></div>
                    <div className="sk-circle6 sk-circle"></div>
                    <div className="sk-circle7 sk-circle"></div>
                    <div className="sk-circle8 sk-circle"></div>
                    <div className="sk-circle9 sk-circle"></div>
                    <div className="sk-circle10 sk-circle"></div>
                    <div className="sk-circle11 sk-circle"></div>
                    <div className="sk-circle12 sk-circle"></div>
                  </div> :
                  <div>
                    <i className={"glyphicon glyphicon-heart player-like-icon" + (track.liked ? " liked" : "")}/>
                    <span className="player-like-count">{track.like_count || '0'}</span>
                  </div>}
                </div>
            </div>
            <div className="audio-player-center">
              <div className="audio-controls">
                <i className="glyphicon glyphicon-step-backward"
                   onClick={this._previousTrack}></i>
                {this.state.loadingTrack ?
                  <i className="glyphicon glyphicon-pause disabled" /> :
                  <i className={`glyphicon ${this.state.playing ? "glyphicon-pause" : "glyphicon-play"}`}
                     onClick={this._togglePlay}></i>}
                <i className="glyphicon glyphicon-step-forward"
                   onClick={this._nextTrack}></i>
              </div>
              {this.state.loadingTrack ? (
                this.state.unableToLoadTrack ?
                  <div className="unable-to-load-track">
                    <i className="glyphicon glyphicon-remove"></i>
                    <p>Could not locate audio for this track...</p>
                  </div> :
                  <div className="audio-player-spinner"></div>
                ) :
                <div className="audio-progress-bar">
                  <span className="audio-current-time">{formatTime(this.state.currentTime)}</span>
                  <div className="progress-bar">
                    <div className="progress-bar-bg"
                         onClick={this._clickProgressBar}/>
                    <div className="progress-bar-fg"
                         onClick={this._clickProgressBar}/>
                    <div className="progress-bar-head"
                         onMouseDown={this._clickProgressHead}/>
                  </div>
                  <span className="audio-total-time">{formatTime(this.state.duration)}</span>
                </div>}
              <div className="audio-volume-control">
                <i className="glyphicon glyphicon-volume-up"
                   onClick={this._toggleVolumeSelector}></i>
                 <div className="volume-selector"
                      onClick={this._clickVolumeBar}>
                   <div className="volume-rail" />
                   <div className="volume-head"
                        onMouseDown={this._clickVolumeHead}/>
                 </div>
              </div>
            </div>
            <div className="playing-track open"
                 onClick={this._toggleQueue}>
              <p>{track.title} <i className="glyphicon glyphicon-triangle-top" /></p>
            </div>
            <div>
              <ul className="track-queue">{
                this.state.tracks.map(track => {
                  return <SearchResult key={track.storeId}
                  track={track}
                  textWidth={190}
                  onRemove={this._removeTrack}
                  onClick={this._playTrack}
                  type="queue" />;
                })
              }</ul>
            </div>
          </nav> :
          ""
      }</div>
    );
  }
});

// PROGRESS BAR HELPERS
function mousePercentProgressBar (e) {
  const bar = $(".progress-bar");
  let percent = (e.pageX - bar.position().left) / bar.width();
  if (percent < 0) { percent = 0; } else if (percent > 1) { percent = 1; }
  return percent;
}

function moveProgressHead (e) {
  const percent = mousePercentProgressBar(e);
  AudioPlayer.moveProgressHead(percent);
}

function progressHeadReleased (e) {
  const percent = mousePercentProgressBar(e);
  AudioPlayer.setCurrentTime(percent);
  AudioPlayer.resumeUpdating();
  $(window).off('mousemove', moveProgressHead);
  $(window).off('mouseup', progressHeadReleased);
}

// VOLUME BAR HELPERS
function mousePercentVolumeBar (e) {
  const rail = $(".volume-rail");
  let percent = (e.pageY - rail.offset().top) / rail.height();
  if (percent < 0) { percent = 0; } else if (percent > 1) { percent = 1; }
  return percent;
}

function moveVolumeHead (e) {
  const percent = mousePercentVolumeBar(e);
  setVolume(percent);
}

function volumeHeadReleased (e) {
  const percent = mousePercentVolumeBar(e);
  setVolume(percent);
  $(window).off('mousemove', moveVolumeHead);
  $(window).off('mouseup', volumeHeadReleased);
}

function setVolume (percent) {
  $('.volume-head').css('top', percent * $(".volume-rail").height());
  AudioPlayer.setVolume(1 - percent);
}

function initVolume () {
  const topStr = $('.volume-head').css('top');
  const top = parseInt(topStr.slice(0, topStr.length - 2));
  const percent = top / $(".volume-rail").height();
  AudioPlayer.setVolume(1 - percent);
}

// TIME HELPERS
function formatTime (seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${padNumber(minutes)}:${padNumber(seconds)}`;
}

function padNumber (num) {
  if (num < 10) {
    return `0${num}`;
  } else {
    return num;
  }
}

// SPINNER
const NUM_ELS = 50;
const ANIME_TIME = 1.2;
let _spinnerSetup = false;

function setupSpinner () {
  if (_spinnerSetup) { return; }
  const aps = $('.audio-player-spinner');
  takeDownSpinner();
  const elWidth = 100 / (NUM_ELS * 2.0);
  for (let i = Math.floor(NUM_ELS / 2); i >= 0; i--) {
    addSpinnerEl(aps, elWidth, i);
  }
  for (let i = NUM_ELS - 1; i > NUM_ELS / 2; i--) {
    addSpinnerEl(aps, elWidth, i);
  }
  _spinnerSetup = true;
}

function takeDownSpinner () {
  $('.spinner-el').remove();
  _spinnerSetup = false;
}

function addSpinnerEl (aps, width, i) {
  const el = $('<div><div>');
  el.addClass('spinner-el');
  const delayTime = (ANIME_TIME / NUM_ELS) * i;
  el.css('-webkit-animation-delay', `-${delayTime}s`);
  el.css('animation-delay', `-${delayTime}s`);
  el.css('width', `${width}%`);
  aps.append(el);
}
