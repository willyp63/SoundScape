const TrackIndexItem = require('./track_index_item');
const ReportIndexItem = require('./report_index_item');
const TrackStore = require('../../stores/track_store');
const TrackActions = require('../../actions/track_actions');
const ErrorActions = require('../../actions/error_actions');
const ModalActions = require('../../actions/modal_actions');
const PlayerActions = require('../../actions/player_actions');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {tracks: [], loading: true, cannotLoad: false};
  },
  componentWillMount () {
    window.addEventListener('scroll', this._onScroll);
    _listeners.push(TrackStore.addListener(this._onChange));

    TrackActions.setIndexType(this.props.indexType);
    this.props.fetchInitialTracks();
  },
  componentWillReceiveProps (newProps) {
    this.setState({tracks: [], loading: true});
    newProps.fetchInitialTracks();
  },
  componentWillUnmount () {
    window.removeEventListener('scroll', this._onScroll);
    _listeners.forEach(listener => listener.remove());
  },
  _onScroll (e) {
    const maxScrollY = $('.main-content').height() - (3 * window.innerHeight);
    if (TrackStore.hasMoreTracks() && !this.state.loading && window.scrollY >= maxScrollY) {
      this.setState({loading: true});
      const offset = this.state.tracks.length;
      this.props.fetchMoreTracks(offset);
    }
  },
  _onChange () {
    this.setState({tracks: TrackStore.all(), loading: false, cannotLoad: TrackStore.cannotLoadTracks()});
  },
  _updateTrack (track) {
    ErrorActions.removeErrors();
    ModalActions.show("TRACK", "UPDATE", track);
  },
  _playAll () {
    PlayerActions.playTracks(this.state.tracks);
  },
  _shuffleAll () {
    PlayerActions.playShuffledTracks(this.state.tracks);
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
      <div>
        <div className="play-buttons">
          <button className="btn btn-primary btn-lg"
                  onClick={this._playAll}>Play all</button>
          <button className="btn btn-primary btn-lg"
                  onClick={this._shuffleAll}>Shuffle all</button>
        </div>
        <div className='track-index'>{
          rows.map(row => {
            return (
              <div key={row[0].storeId} className="track-index-row">{
                row.map(track => {
                  return (this.props.indexType === "REPORTS" ?
                          <ReportIndexItem key={track.storeId}
                                          track={track}
                                          indexType={this.props.indexType}
                                          updateTrack={this._updateTrack}/> :
                          <TrackIndexItem key={track.storeId}
                                          track={track}
                                          indexType={this.props.indexType}
                                          updateTrack={this._updateTrack}/>);
                })
              }</div>
            );
          })
        }</div>
        { this.state.loading ?
          <div className="track-spinner">
            <div className="rect1"></div>
            <div className="rect2"></div>
            <div className="rect3"></div>
            <div className="rect4"></div>
            <div className="rect5"></div>
          </div> : ""}
        { !this.state.loading && !this.state.tracks.length ? (
            this.state.cannotLoad ?
              <div className='no-results-text'>Unable to connect to Spotify API...</div> :
              <div className='no-results-text'>No Tracks Found...</div>) : ''}
      </div>
    );
  }
});
