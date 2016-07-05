const React = require('react');
const TrackActions = require('../actions/track_actions');
const TrackIndex = require('./tracks/track_index');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

module.exports = React.createClass({
  getInitialState () {
    return {indexType: "MOST_RECENT"};
  },
  _fetchInitialTracks () {
    TrackActions.fetchAllTracks(INITIAL_REQUEST_SIZE);
  },
  _fetchMoreTracks (offset) {
    TrackActions.appendAllTracks(ADDITIONAL_REQUEST_SIZE, offset);
  },
  _navItemClick (e) {
    this.setState({indexType: e.target.id});
  },
  render () {
    return (
      <div>
        <ul className="my-navbar">
          <li id="MOST_RECENT"
              className={this.state.indexType === "MOST_RECENT" ? "selected" : ""}
              onClick={this._navItemClick}>Most Recent
          </li>
          <li id="MOST_LIKED"
              className={this.state.indexType === "MOST_LIKED" ? "selected" : ""}
              onClick={this._navItemClick}>Most Liked
          </li>
        </ul>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType="ALL" />
      </div>
    );
  }
});
