const TrackIndex = require('./tracks/track_index');
const TrackActions = require('../actions/track_actions');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

module.exports = React.createClass({
  _fetchInitialTracks () {
    TrackActions.fetchReportedTracks(INITIAL_REQUEST_SIZE, 0);
  },
  _fetchMoreTracks (offset) {
    TrackActions.fetchReportedTracks(ADDITIONAL_REQUEST_SIZE, offset);
  },
  render () {
    return (
      <div>
        <div className="search-results-header">
          <p>Reported Tracks</p>
        </div>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType="REPORTS" />
      </div>
    );
  }
});
