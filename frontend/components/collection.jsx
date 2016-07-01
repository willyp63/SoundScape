const React = require('react');

const TrackStore = require('../stores/track_store');
const TrackActions = require('../actions/track_actions');

const TrackIndex = require('./tracks/track_index');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {indexType: "MY_TRACKS", tracks: TrackStore.all()};
  },
  componentWillMount () {
    _listeners.push(TrackStore.addListener(this._trackChange));
    this._fetchTracks();
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _fetchTracks () {
    if (this.state.indexType === "MY_TRACKS") {
      TrackActions.fetchPostedTracks();
    } else {
      TrackActions.fetchLikedTracks();
    }
  },
  _trackChange () {
    this.setState({tracks: TrackStore.all()});
  },
  _navItemClick (e) {
    this.setState({indexType: e.target.id}, function () {
      this._fetchTracks();
    });
  },
  render () {
    return (
      <div>
        <ul className="my-navbar">
          <li id="MY_TRACKS"
              className={this.state.indexType === "MY_TRACKS" ? "selected" : ""}
              onClick={this._navItemClick}>Tracks
          </li>
          <li id="MY_LIKES"
              className={this.state.indexType === "MY_LIKES" ? "selected" : ""}
              onClick={this._navItemClick}>Likes
          </li>
        </ul>
        <TrackIndex tracks={this.state.tracks} indexType={this.state.indexType} />
      </div>
    );
  }
});
