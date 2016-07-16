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
          <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467765103/banner_g9ggmj.jpg"/>
          <span className="tag-line">Sample Millions of Tracks</span>
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
