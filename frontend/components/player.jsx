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
    return {tracks: PlayerStore.tracks(), playing: true, trackIndex: 0,
      loading: false, currentTime: 0, duration: 0};
  },
  componentWillMount () {
    _listeners.push(PlayerStore.addListener(this._onChange));
    _listeners.push(TrackStore.addListener(this._trackChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange () {
    if (PlayerStore.newTracks()) {
      if (this.state.tracks.length) { AudioPlayer.removeListeners(); }
      this.setState({tracks: PlayerStore.tracks(), trackIndex: 0}, this._beginPlaying);
    } else {
      this.setState({tracks: PlayerStore.tracks(), loading: false});
    }
  },
  _trackChange () {
    this.setState({loading: false});
  },
  _beginPlaying () {
    if (this.state.tracks.length) {
      AudioPlayer.moveProgressHead(0);
      this.setState({playing: true, currentTime: 0}, function () {
        AudioPlayer.init(this._onLoad, this._timeUpdate, this._onEnd);
      });
    }
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
    if (this.state.trackIndex >= this.state.tracks.length - 1) {
      this.setState({playing: false});
    } else {
      this.setState({trackIndex: this.state.trackIndex + 1}, this._beginPlaying);
    }
  },
  _togglePlay () {
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
    let newIndex = this.state.trackIndex + 1;
    if (newIndex >= this.state.tracks.length) { newIndex = 0; }
    this.setState({trackIndex: newIndex}, this._beginPlaying);
  },
  _previousTrack () {
    let newIndex = this.state.trackIndex - 1;
    if (newIndex < 0) { newIndex = this.state.tracks.length - 1; }
    this.setState({trackIndex: newIndex}, this._beginPlaying);
  },
  _playTack (track) {
    const newIndex = this.state.tracks.indexOf(track);
    if (newIndex < 0) { return; }
    this.setState({trackIndex: newIndex}, this._beginPlaying);
  },
  _closePlayer () {
    AudioPlayer.removeListeners();
    PlayerActions.closePlayer();
  },
  _likeTrack () {
    const track = this.state.tracks[this.state.trackIndex];
    if (!SessionStore.loggedIn()) {
      // show signup form

      ErrorActions.removeErrors();
      ModalActions.show("USER", "SIGNUP");
    } else {
      this.setState({loading: true});
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
    const track = this.state.tracks[this.state.trackIndex];
    return (
      <div>{
        track ?
          <nav className="audio-player-bar">
            <audio controls id="audio-player">
              <source src={track.audio_url} type="audio/mpeg"/>
            </audio>
            <div className="playing-image">
              <i className="glyphicon glyphicon-remove" onClick={this._closePlayer}/>
              <img src={track.image_url} width="40" height="40"/>
              <div className="player-like-button" onClick={this._likeTrack}>
                {this.state.loading ?
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
              </div>
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
