const React = require('react');
const PlayerActions = require('../../actions/player_actions');

module.exports = React.createClass({
  _onClick () {
    const myTrack = {title: this.props.track.name,
                     audio_url: this.props.track.preview_url,
                     image_url: this.props.track.album.images[0].url};
    PlayerActions.playTrack(myTrack);
  },
  render () {
    return (
      <li onClick={this._onClick} className="cf">
        <p>{`${this.props.track.name} - ${this.props.track.artists[0].name}`}</p>
        <img src={this.props.track.album.images[0].url} width="40" height="40"/>
      </li>
    );
  }
});
