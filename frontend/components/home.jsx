const React = require('react');
const TrackActions = require('../actions/track_actions');
const TrackIndex = require('./tracks/track_index');

const TRACKS_PER_REQUEST = 40;

module.exports = React.createClass({
  _fetchInitialTracks () {
    TrackActions.fetchAllTracks(TRACKS_PER_REQUEST);
  },
  _fetchMoreTracks (offset) {
    TrackActions.appendAllTracks(TRACKS_PER_REQUEST, offset);
  },
  render () {
    return (
      <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                  fetchMoreTracks={this._fetchMoreTracks}
                  indexType="ALL" />
    );
  }
});
