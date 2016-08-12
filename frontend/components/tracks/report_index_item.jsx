const PlayerActions = require('../../actions/player_actions');
const ReportActions = require('../../actions/report_actions');

module.exports = React.createClass({
  getInitialState () {
    return {hover: false, loading: false, adding: false};
  },
  componentWillReceiveProps (newProps) {
    this.setState({loading: false});
  },
  _highlightPlay () {
    $('.play-circle-bg').addClass('highlighted');
  },
  _unhighlightPlay () {
    $('.play-circle-bg').removeClass('highlighted');
  },
  _highlightPlus () {
    $('.plus-icon-bg').addClass('highlighted');
  },
  _unhighlightPlus () {
    $('.plus-icon-bg').removeClass('highlighted');
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
  _clearTrack () {
    ReportActions.clearTrackReports(this.props.track);
  },
  render () {
    return (
      <div className="track-index-item">
        <div className="track-image"
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}>
          <img src={this.props.track.image_url} width="225" height="225"></img>
          <span className="track-image-overlay" id={`overlay-${this.props.track.id}`}></span>
          {this.state.hover ?
            <div>
              <span className="play-circle-bg"></span>
              <i className="glyphicon glyphicon-play-circle play-circle-icon"
                 onClick={this._playTrack}
                 onMouseEnter={this._highlightPlay}
                 onMouseLeave={this._unhighlightPlay}/>
                <div>
                  <span className="plus-icon-bg"></span>
                  <i className={`glyphicon glyphicon-check plus-icon${this.state.adding ? ' active' : ''}`}
                                onMouseEnter={this._highlightPlus}
                                onMouseLeave={this._unhighlightPlus}
                                onClick={this._clearTrack}/>
                </div>
            </div> : ""}
        </div>
        <div className="track-text">
          <p>{this.props.track.title}</p>
        </div>
      </div>
    );
  }
});
