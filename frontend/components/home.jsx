const React = require('react');

const TrackStore = require('../stores/track_store');
const TrackActions = require('../actions/track_actions');

const TrackIndex = require('./tracks/track_index');

const TRACKS_PER_REQUEST = 40;

const _listeners = [];
let _appending = false;

module.exports = React.createClass({
  getInitialState () {
    return {tracks: TrackStore.all()};
  },
  componentWillMount () {
    _listeners.push(TrackStore.addListener(this._trackChange));
    TrackActions.fetchAllTracks(TRACKS_PER_REQUEST);

    // listen for scroll
    window.addEventListener('scroll', this._onScroll);
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
    window.removeEventListener('scroll', this._onScroll);
  },
  _onScroll (e) {
    const maxScrollY = $('.main-content').height() - (window.innerHeight * 2);
    if (!_appending && window.scrollY >= maxScrollY) {
      _appending = true;
      const offset = this.state.tracks.length;
      TrackActions.appendAllTracks(TRACKS_PER_REQUEST, offset);
    }
  },
  _trackChange () {
    this.setState({tracks: TrackStore.all()}, function () {
      _appending = false;
    });
  },
  render () {
    return (
      <TrackIndex tracks={this.state.tracks} indexType="ALL" />
    );
  }
});
