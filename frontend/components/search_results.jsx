const React = require('react');

const TrackStore = require('../stores/track_store');
const SearchActions = require('../actions/search_actions');

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
    SearchActions.searchTracks(this.props.params.query, TRACKS_PER_REQUEST, 0);

    // listen for scroll
    window.addEventListener('scroll', this._onScroll);
  },
  componentWillReceiveProps (newProps) {
    SearchActions.searchTracks(newProps.params.query, TRACKS_PER_REQUEST, 0);
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
      SearchActions.searchTracks(this.props.params.query, TRACKS_PER_REQUEST, offset);
    }
  },
  _trackChange () {
    this.setState({tracks: TrackStore.all()}, function () {
      _appending = false;
    });
  },
  render () {
    return (
      <div>
        <div className="search-results-header">
          <p>{`Results for: '${this.props.params.query}'`}</p>
        </div>
        <TrackIndex tracks={this.state.tracks} indexType="SEARCH" />
      </div>
    );
  }
});
