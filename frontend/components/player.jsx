const React = require('react');
const PlayerStore = require('../stores/player_store');
const TrackStore = require('../stores/track_store');
const SessionStore = require('../stores/session_store');
const AudioPlayer = require('../util/audio_player');
const PlayerActions = require('../actions/player_actions');
const ModalActions = require('../actions/modal_actions');
const ErrorActions = require('../actions/error_actions');
const TrackActions = require('../actions/track_actions');
const SearchResult = require('./nav_bar/search_result');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {tracks: PlayerStore.tracks(), playing: true, loadingLike: false,
      loadingTrack: true, currentTime: 0, duration: 0, playingTrack: null, playingUrl: null};
  },
  componentWillMount () {
    _listeners.push(PlayerStore.addListener(this._onChange));
    _listeners.push(TrackStore.addListener(this._trackChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange () {
    // update tracks
    const newTracks = PlayerStore.tracks();
    this.setState({tracks: newTracks});

    // close player if no tracks
    if (!newTracks.length) {
      this.setState({playingTrack: null});
      return;
    }

    const newPlayTrack = PlayerStore.playTrack();
    if (!this.state.playingTrack || newPlayTrack.storeId !== this.state.playingTrack.storeId) {
      // update playing track and try to play
      this.setState({playingTrack: newPlayTrack}, this._tryToPlayAudio);
    } else {
      if (newPlayTrack.liked !== this.state.playingTrack.liked) {
        // update playing track and stop like loading
        this.setState({loadingLike: false, playingTrack: newPlayTrack});
      } else if (this.state.loadingTrack) {
        // check if audio has downloaded
        this._checkAudioDownload();
      }
    }
  },
  _checkAudioDownload () {
    AudioPlayer.removeListeners();
    const playTrack = this.state.playingTrack;
    if (PlayerStore.hasUrl(playTrack)) {
      const numSeconds = PlayerStore.getDuration(this.state.playingTrack);
      const numChunks = PlayerStore.getChunks(this.state.playingTrack);
      const currPercent = (numChunks / numSeconds) / 1.02;
      endSpinner(currPercent, function () {
        const url = PlayerStore.getUrl(playTrack);
        this.setState({loadingTrack: false, playingUrl: url}, this._beginPlaying);
      }.bind(this));
    } else {
      this.setState({loadingTrack: true, playingUrl: null}, function () {
        setupSpinner();
        this._updateSpinner();
      }.bind(this));
    }
  },
  _tryToPlayAudio () {
    AudioPlayer.removeListeners();
    const playTrack = this.state.playingTrack;
    if (PlayerStore.hasUrl(playTrack)) {
      const url = PlayerStore.getUrl(playTrack);
      this.setState({loadingTrack: false, playingUrl: url}, this._beginPlaying);
    } else {
      this.setState({loadingTrack: true, playingUrl: null}, function () {
        setupSpinner();
        this._updateSpinner();
      }.bind(this));
    }
  },
  _updateSpinner () {
    const numSeconds = PlayerStore.getDuration(this.state.playingTrack);
    const numChunks = PlayerStore.getChunks(this.state.playingTrack);
    const percent = (numChunks / numSeconds) / 1.01;
    setSpinnerPercent(percent, {limit: true});
  },
  _trackChange () {
    this.setState({loadingLike: false});
  },
  _beginPlaying () {
    takeDownSpinner();
    initVolume();
    AudioPlayer.moveProgressHead(0);
    this.setState({playing: true, currentTime: 0}, function () {
      AudioPlayer.init(this._onLoad, this._timeUpdate, this._onEnd);
    });
  },
  _onLoad () {
    this.setState({duration: AudioPlayer.duration()}, function () {
      AudioPlayer.play();
    });
  },
  _timeUpdate () {
    AudioPlayer.timeUpdate();
    this.setState({currentTime: AudioPlayer.currentTime()});
  },
  _onEnd () {
    PlayerActions.playNextTrack();
  },
  _togglePlay () {
    if (this.state.loadingTrack) { return; }
    this.state.playing ? AudioPlayer.pause() : AudioPlayer.play();
    this.setState({playing: !this.state.playing});
  },
  _clickProgressBar (e) {
    const percent = mousePercentProgressBar(e);
    AudioPlayer.setCurrentTime(percent);
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
  _nextTrack () {
    PlayerActions.playNextTrack();
  },
  _previousTrack () {
    PlayerActions.playPrevTrack();
  },
  _playTack (track) {
    PlayerActions.playThisTrack(track);
  },
  _closePlayer () {
    AudioPlayer.removeListeners();
    PlayerActions.closePlayer();
  },
  _likeTrack () {
    if (!SessionStore.loggedIn()) {
      // show signup form

      ErrorActions.removeErrors();
      ModalActions.show("USER", "SIGNUP");
    } else {
      const track = this.state.playingTrack;
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
  render () {
    const track = this.state.playingTrack;
    return (
      <div>{
        track ?
          <nav className="audio-player-bar">
            <div className="playing-image">
              <i className="glyphicon glyphicon-remove" onClick={this._closePlayer}/>
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
                    <span className="player-like-count">{track.like_count}</span>
                  </div>}
                </div>
            </div>
            <div className="audio-player-center">
              <div className="audio-controls">
                <i className="glyphicon glyphicon-step-backward"
                   onClick={this._previousTrack}></i>
                <i className={`glyphicon ${this.state.playing ? "glyphicon-pause" : "glyphicon-play"}`}
                   onClick={this._togglePlay}></i>
                <i className="glyphicon glyphicon-step-forward"
                   onClick={this._nextTrack}></i>
              </div>
              {this.state.loadingTrack ?
                <div className="audio-player-spinner">
                </div> :
                <div className="audio-progress-bar">
                  <audio controls id="audio-player">
                    <source src={this.state.playingUrl} type="audio/mpeg"/>
                  </audio>
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
                  return <SearchResult key={track.id}
                  track={track}
                  textWidth={220}
                  onClick={this._playTack} />;
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
const END_ANIME_STEP_TIME = 0.1;
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

function endSpinner (currPercent, onFinish) {
  let currEls = Math.floor(NUM_ELS * currPercent);
  if (currEls >= NUM_ELS) { currEls = NUM_ELS - 1; }
  stepSpinner(currEls + 1, END_ANIME_STEP_TIME, onFinish);
}

function stepSpinner (els, stepTime, onFinish) {
  setSpinnerPercent(els / NUM_ELS, {limit: false});
  if (els < NUM_ELS) {
    setTimeout(function () {
      stepSpinner(els + 1, stepTime, onFinish);
    }, stepTime * 1000);
  } else {
    setTimeout(onFinish, stepTime * 1000);
  }
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

function setSpinnerPercent (percent, options) {
  const spinnerEls = $('.spinner-el');
  let lastActiveIdx = Math.floor(NUM_ELS * percent);
  if (lastActiveIdx >= NUM_ELS) {
    if (options.limit) {
      lastActiveIdx = NUM_ELS - 1;
    } else {
      lastActiveIdx = NUM_ELS;
    }
  }
  for (var i = 0; i < lastActiveIdx; i++) {
    spinnerEls[i].className = 'spinner-el active';
  }
  for (var i = lastActiveIdx; i < NUM_ELS; i++) {
    spinnerEls[i].className = 'spinner-el';
  }
}
