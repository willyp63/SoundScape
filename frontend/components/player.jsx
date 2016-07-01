const React = require('react');
const PlayerStore = require('../stores/player_store');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {track: PlayerStore.track()};
  },
  componentWillMount () {
    _listeners.push(PlayerStore.addListener(this._onChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange () {
    const track = PlayerStore.track();
    this.setState({track: track}, function () {
      const audioPlayer = document.getElementById('audio-player');
      // reload audio
      audioPlayer.load();
      audioPlayer.play();
    });
  },
  render () {
    return (
      <div>{
        this.state.track ?
          <nav className="audio-player-bar">
            <div className="playing-track">
              <p>{this.state.track.title}</p>
            </div>
            <audio controls id="audio-player">
              <source src={this.state.track.audio_url} type="audio/mpeg"/>
            </audio>
            <div className="track-queue">
              <p>Queue</p>
            </div>
          </nav> :
          ""
      }</div>
    );
  }
});
