const React = require('react');
const PlayerActions = require('../../actions/player_actions');
const TrackActions = require('../../actions/track_actions');
const SessionStore = require('../../stores/session_store');

module.exports = React.createClass({
  getInitialState () {
    return {hover: false};
  },
  _highlightPlay () {
    $('.play-circle-bg').addClass('highlighted');
  },
  _unhighlightPlay () {
    $('.play-circle-bg').removeClass('highlighted');
  },
  _highlightLike () {
    $('.like-icon-bg').addClass('highlighted');
  },
  _unhighlightLike () {
    $('.like-icon-bg').removeClass('highlighted');
  },
  _onMouseEnter () {
    this.setState({hover: true}, function () {
      $(`#overlay-${this.props.track.id}`).addClass('active');
    });
  },
  _onMouseLeave () {
    this.setState({hover: false}, function () {
      $(`#overlay-${this.props.track.id}`).removeClass('active');
    });
  },
  _playTrack () {
    PlayerActions.playTrack(this.props.track);
  },
  _likeTrack () {
    if (typeof this.props.track.id === 'string') {
      TrackActions.postAndLikeTrack(this.props.track);
    } else {
      if (this.props.track.liked) {
        TrackActions.unlikeTrack(this.props.track);
      } else {
        TrackActions.likeTrack(this.props.track);
      }
    }
  },
  render () {
    let title = this.props.track.title;
    if (title.length > 27) { title = title.slice(0, 25) + '...'; }
    return (
      <div className="track-index-item"
           onMouseEnter={this._onMouseEnter}
           onMouseLeave={this._onMouseLeave}>
        <div className="track-image">
          <img src={this.props.track.image_url} width="225" height="225"></img>
          <span className="track-image-overlay" id={`overlay-${this.props.track.id}`}></span>
          {this.state.hover ?
            <div>
              <span className="play-circle-bg"></span>
              <i className="glyphicon glyphicon-play-circle play-circle-icon"
                 onClick={this._playTrack}
                 onMouseEnter={this._highlightPlay}
                 onMouseLeave={this._unhighlightPlay}/>
              {(this.props.indexType === "ALL" || this.props.indexType === "SEARCH") && SessionStore.loggedIn() ?
                <div>
                  <span className="like-icon-bg"></span>
                  <i className={"glyphicon glyphicon-heart like-icon" + (this.props.track.liked ? " liked" : "")}
                     onClick={this._likeTrack}
                     onMouseEnter={this._highlightLike}
                     onMouseLeave={this._unhighlightLike}/>
                </div> : ""}
            </div> :
            ""}
        </div>
        <p>{title}</p>
      </div>
    );
  }
});
