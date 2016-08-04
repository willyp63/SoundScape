const SearchActions = require('../actions/search_actions');
const SessionActions = require('../actions/session_actions');
const TrackActions = require('../actions/track_actions');
const SessionStore = require('../stores/session_store');
const TrackStore = require('../stores/track_store');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

const _listeners = [];

/* LOOK HERE */
const _trackKeys = ['MOST_LIKED', 'MOST_RECENT', 'RANDOM_ARTIST'];

module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn()};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));

    /* AND HERE */
    _listeners.push(TrackStore.addListener(this._trackChange));
    TrackActions.fetchSplashTracks(_trackKeys);
  },
  _trackChange () {
    /* AND HERE */
    if (TrackStore.splashTracks()) {
      console.log(TrackStore.splashTracks());
    }
  },
  _sessionChange () {
    this.setState({loggedIn: SessionStore.loggedIn()});
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _fetchInitialTracks () {
    SearchActions.fetchResults(_randomQuery, INITIAL_REQUEST_SIZE, 0);
  },
  _fetchMoreTracks (offset) {
    SearchActions.fetchResults(_randomQuery, ADDITIONAL_REQUEST_SIZE, offset);
  },
  _demoLogin () {
    SessionActions.login({username: 'guest123', password: 'mrqhkl71'});
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
      </div>
    );
  }
});
