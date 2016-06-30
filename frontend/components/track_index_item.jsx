const React = require('react');
const PlayerActions = require('../actions/player_actions');
const TrackActions = require('../actions/track_actions');

module.exports = React.createClass({
  getInitialState () {
    return {hover: false};
  },
  _onMouseEnter () {
    this.setState({hover: true});
  },
  _onMouseLeave () {
    this.setState({hover: false});
  },
  _playTrack () {
    PlayerActions.playTrack(this.props.track);
  },
  _likeTrack () {
    if (this.props.track.liked) {
      TrackActions.unlikeTrack(this.props.track);
    } else {
      TrackActions.likeTrack(this.props.track);
    }
  },
  render () {
    return (
      <div className="track-index-item"
           onMouseEnter={this._onMouseEnter}
           onMouseLeave={this._onMouseLeave}>
        <div className="track-image">
          <img src={this.props.track.image_url}>
          </img>
          {this.state.hover ?
            <div>
              <span className="play-circle-bg"></span>
              <i className="glyphicon glyphicon-play-circle play-circle-icon" onClick={this._playTrack}/>
              {this.props.type === "all" ?
                <div>
                  <span className="like-bg"></span>
                  <i className={"glyphicon glyphicon-heart like-icon" + (this.props.track.liked ? " liked" : "")}
                     onClick={this._likeTrack}/>
                </div> : ""}
            </div> :
            ""}
        </div>
        <p>{this.props.track.title}</p>
      </div>
    );
  }
});
