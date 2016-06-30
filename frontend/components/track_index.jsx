const React = require('react');
const TrackStore = require('../stores/track_store');
const TrackActions = require('../actions/track_actions');
const TrackIndexItem = require('./track_index_item');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {tracks: TrackStore.all(), type: ""};
  },
  componentWillMount () {
    _listeners.push(TrackStore.addListener(this._onChange));
    switch (this.props.location.pathname) {
      case "/":
        TrackActions.fetchAllTracks();
        this.setState({type: "all"});
        break;
      case "/collection/likes":
        TrackActions.fetchLikedTracks();
        this.setState({type: "liked"});
        break;
      case "/collection/tracks":
        TrackActions.fetchPostedTracks();
        this.setState({type: "posted"});
        break;
    }
  },
  componentWillReceiveProps (newProps) {
    switch (newProps.location.pathname) {
      case "/":
        TrackActions.fetchAllTracks();
        this.setState({type: "all"});
        break;
      case "/collection/likes":
        TrackActions.fetchLikedTracks();
        this.setState({type: "liked"});
        break;
      case "/collection/tracks":
        TrackActions.fetchPostedTracks();
        this.setState({type: "posted"});
        break;
    }
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange () {
    this.setState({tracks: TrackStore.all()});
  },
  render () {
    // seperate tracks into rows
    const numTracks = this.state.tracks.length;
    const numRows = Math.ceil(numTracks / 4);
    const rows = [];
    for (let i = 0; i < numRows; i++) { rows.push([]); }
    for (let i = 0; i < numTracks; i++) {
      const RowIndex = Math.floor(i / 4);
      rows[RowIndex].push(this.state.tracks[i]);
    }
    return (
      <div className='track-index'>{
        rows.map(row => {
          return (
            <div key={row[0].id} className="track-index-row">{
              row.map(track => {
                return <TrackIndexItem key={track.id} track={track} type={this.state.type} />;
              })
            }</div>
          );
        })
      }</div>
    );
  }
});
