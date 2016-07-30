const SearchActions = require('../actions/search_actions');
const TrackIndex = require('./tracks/track_index');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

module.exports = React.createClass({
  _fetchInitialTracks () {
    SearchActions.fetchResults(this.props.params.query, INITIAL_REQUEST_SIZE, 0);
  },
  _fetchMoreTracks (offset) {
    SearchActions.fetchResults(this.props.params.query, ADDITIONAL_REQUEST_SIZE, offset);
  },
  render () {
    return (
      <div>
        <div className="search-results-header">
          <p>{`Results for: '${this.props.params.query}'`}</p>
        </div>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType="SEARCH" />
      </div>
    );
  }
});
