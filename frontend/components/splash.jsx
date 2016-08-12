const SearchActions = require('../actions/search_actions');
const SessionActions = require('../actions/session_actions');
const TrackActions = require('../actions/track_actions');
const SessionStore = require('../stores/session_store');
const TrackStore = require('../stores/track_store');
const randomQueries = require('../constants/random_queries');
const React = require('react');
const Carousel = require('./carousel');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

const _listeners = [];


module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn(),
            trackHash: null,
            loading: true,
            cannotLoad: false};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
    let artists = this._fetchRandomArtists();
    let _trackKeys = ['MOST_LIKED', "MOST_RECENT"];
    _trackKeys = _trackKeys.concat(artists);
    _listeners.push(TrackStore.addListener(this._trackChange));
    TrackActions.fetchSplashTracks(_trackKeys);
  },
  _fetchRandomArtists() {
    let arr = [];
    while (arr.length < 7) {
      let rand = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      if (!arr.includes(rand)) {
        arr.push(rand);
      }
    }
    return arr;
  },
  _trackChange () {
    let tracks = TrackStore.splashTracks();
    this.setState({trackHash: tracks, loading: false, cannotLoad: TrackStore.cannotLoadTracks()});
  },
  _sessionChange () {
    this.setState({loggedIn: SessionStore.loggedIn()});
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _demoLogin () {
    SessionActions.login({username: 'guest123', password: 'mrqhkl71'});
  },
  _buildCarousels(tracks) {
    let carousels = [];
    let key = 0;
    Object.keys(tracks).forEach((category) => {
      let categoryTracks = tracks[category];
      if (categoryTracks.length >= 20) {
        categoryTracks = categoryTracks.slice(0, 20);
      } else {
        categoryTracks = categoryTracks.slice(0, ((categoryTracks.length) - (categoryTracks.length % 4)));
      }

      if (categoryTracks.length >= 8) {
        carousels.push(
          <div>
          <Carousel key={key++} category={category} tracks={categoryTracks}/>
          </div>);
      }
    });
    return (<div>{carousels}</div>);
  },
  render () {
    return (
      <div>
        <div className="banner">
          <p className='tag-line-1'>All Your Favorite Music</p>
          <p className='tag-line-2'>Uninterrupted and Ad-Free</p>
          <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1469248079/landscape_hbrvih.jpg"/>
          <div className="right-splash-buffer" />
          <div className="left-splash-buffer" />
          {this.state.loggedIn ? "" :
            <button className="btn btn-success try-it-button" onClick={this._demoLogin}>Try It Out!</button>}
        </div>
        { this.state.loading ?
          <div className="track-spinner">
            <div className="rect1"></div>
            <div className="rect2"></div>
            <div className="rect3"></div>
            <div className="rect4"></div>
            <div className="rect5"></div>
          </div> : "" }
          { this.state.trackHash ? this._buildCarousels(this.state.trackHash) : ""}
        { !this.state.loading && this.state.cannotLoad ?
          <div className='no-results-text'>Unable to connect to Spotify API...</div> : ""}
      </div>
    );
  }
});
