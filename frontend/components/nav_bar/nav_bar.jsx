const React = require('react');

const SessionStore = require('../../stores/session_store');

const LeftNav = require('./left_nav');
const RightNavLoggedIn = require('./right_nav_logged_in');
const RightNavLoggedOut = require('./right_nav_logged_out');
const SearchBar = require('./search_bar');
const UserForm = require('../user_form');
const TrackForm = require('../tracks/track_form');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn()};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _sessionChange () {
    this.setState({loggedIn: SessionStore.loggedIn()});
  },
  render () {
    return (
      <div>
        <nav className="nav-bar">
          <LeftNav pathname={this.props.pathname} />
          <SearchBar />
          { SessionStore.loggedIn() ? <RightNavLoggedIn /> : <RightNavLoggedOut /> }
        </nav>
        { SessionStore.loggedIn() ?
          <div>
            <UserForm key="2" formType="UPDATE" />
          </div> :
          <div>
            <UserForm key="1" formType="LOGIN" />
            <UserForm formType="SIGNUP" />
          </div>}
          <TrackForm formType="NEW" />
      </div>
    );
  }
});
