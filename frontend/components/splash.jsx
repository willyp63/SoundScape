const React = require('react');
const SearchActions = require('../actions/search_actions');
const SessionActions = require('../actions/session_actions');
const SessionStore = require('../stores/session_store');
const TrackIndex = require('./tracks/track_index');
const randomQueries = require('../constants/random_queries');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

let _randomQuery;
const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn()};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
    const i = Math.floor(Math.random() * randomQueries.length);
    _randomQuery = randomQueries[i];
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
    SessionActions.login({username: 'guest', password: 'db84n337vmz39alqp97'});
  },
  render () {
    return (
      <div>
        <div className="banner">
          <p className='tag-line-1'>Your Favorite Music</p>
          <p className='tag-line-2'>Ad-Free and Uninterrupted</p>
          <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1469248079/landscape_hbrvih.jpg"/>
          <div className="right-splash-buffer" />
          <div className="left-splash-buffer" />
          {this.state.loggedIn ? "" :
            <button className="btn btn-success" onClick={this._demoLogin}>Try It Out!</button>}
        </div>
        <div className="search-results-header">
          <p>{`Tracks by: ${_randomQuery}`}</p>
        </div>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType="SPLASH" />
      </div>
    );
  }
});
