const React = require('react');
const PlayerActions = require('../../actions/player_actions');

module.exports = React.createClass({
  _onClick () {
    PlayerActions.playTrack(this.props.track);
  },
  render () {
    return (
      <li onClick={this._onClick} className="cf">
        <p>{`${this.props.track.title} - ${this.props.track.artist}`}</p>
        <img src={this.props.track.image_url} width="40" height="40"/>
      </li>
    );
  }
});
