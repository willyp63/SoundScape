const React = require('react');
const TrackActions = require('../actions/track_actions');
const TrackIndex = require('./tracks/track_index');

module.exports = React.createClass({
  getInitialState () {
    return {indexType: "MY_TRACKS"};
  },
  _fetchInitialTracks () {
    if (this.state.indexType === "MY_TRACKS") {
      TrackActions.fetchPostedTracks();
    } else {
      TrackActions.fetchLikedTracks();
    }
  },
  _fetchMoreTracks (offset) {
    // do nothing
  },
  _navItemClick (e) {
    this.setState({indexType: e.target.id});
    TrackActions.setIndexType(e.target.id);
  },
  render () {
    return (
      <div>
        <ul className="my-navbar">
          <li id="MY_TRACKS"
              className={this.state.indexType === "MY_TRACKS" ? "selected" : ""}
              onClick={this._navItemClick}>My Uploads
          </li>
          <li id="MY_LIKES"
              className={this.state.indexType === "MY_LIKES" ? "selected" : ""}
              onClick={this._navItemClick}>My Likes
          </li>
        </ul>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType={this.state.indexType} />
      </div>
    );
  }
});
