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
      // update playing track
      this.setState({playingTrack: newPlayTrack}, this._tryToPlayAudio);
    } else {
      if (newPlayTrack.liked !== this.state.playingTrack.liked) {
        // like track
        this.setState({loadingLike: false, playingTrack: newPlayTrack});
      } else if (this.state.loadingTrack) {
        // check if audio is downloaded
        this._tryToPlayAudio();
      }
    }
  },
  _tryToPlayAudio () {
    AudioPlayer.removeListeners();

    const playTrack = this.state.playingTrack;
    if (PlayerStore.hasUrl(playTrack)) {
      const url = PlayerStore.getUrl(playTrack);
      this.setState({loadingTrack: false, playingUrl: url}, this._beginPlaying);
    } else {
      this.setState({loadingTrack: true, playingUrl: null});
    }
  },
  _trackChange () {
    this.setState({loadingLike: false});
  },
  _beginPlaying () {
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
              <img src={track.image_url} width="40" height="40"/>
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
                  <div className="rect1"></div>
                  <div className="rect2"></div>
                  <div className="rect3"></div>
                  <div className="rect4"></div>
                  <div className="rect5"></div>
                  <div className="rect6"></div>
                  <div className="rect7"></div>
                  <div className="rect8"></div>
                  <div className="rect9"></div>
                  <div className="rect10"></div>
                  <div className="rect11"></div>
                  <div className="rect12"></div>
                  <div className="rect13"></div>
                  <div className="rect14"></div>
                  <div className="rect15"></div>
                  <div className="rect16"></div>
                  <div className="rect17"></div>
                  <div className="rect18"></div>
                  <div className="rect19"></div>
                  <div className="rect20"></div>
                  <div className="rect21"></div>
                  <div className="rect22"></div>
                  <div className="rect23"></div>
                  <div className="rect24"></div>
                  <div className="rect25"></div>
                  <div className="rect26"></div>
                  <div className="rect27"></div>
                  <div className="rect28"></div>
                  <div className="rect29"></div>
                  <div className="rect30"></div>
                  <div className="rect31"></div>
                  <div className="rect32"></div>
                  <div className="rect33"></div>
                  <div className="rect34"></div>
                  <div className="rect35"></div>
                  <div className="rect36"></div>
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
