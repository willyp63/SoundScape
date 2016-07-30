const SessionStore = require('../../stores/session_store');
const ModalStore = require('../../stores/modal_store');

const LeftNav = require('./left_nav');
const RightNavLoggedIn = require('./right_nav_logged_in');
const RightNavLoggedOut = require('./right_nav_logged_out');
const SearchBar = require('./search_bar');
const UserForm = require('../user_form');
const TrackForm = require('../tracks/track_form');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn(), modal: null};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
    _listeners.push(ModalStore.addListener(this._modalChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _sessionChange () {
    this.setState({loggedIn: SessionStore.loggedIn()});
  },
  _modalChange () {
    if (ModalStore.modal()) {
      // add modal to DOM and then show
      this.setState({modal: ModalStore.modal()}, function () {
        $(`#${this.state.modal.action}-${this.state.modal.type}-MODAL`).modal('show');
      });
    } else if (this.state.modal) {
      // hide current modal and then remove from DOM
      $(`#${this.state.modal.action}-${this.state.modal.type}-MODAL`).modal('hide');
      setTimeout(function () {
        this.setState({modal: null});
      }.bind(this), 500);
    }
  },
  render () {
    return (
      <div>
        {this.state.modal ? (
          this.state.modal.type === 'TRACK' ?
          <TrackForm action={this.state.modal.action} data={this.state.modal.data}/> :
          <UserForm action={this.state.modal.action} />
          ) : '' }
        <nav className="nav-bar">
          <LeftNav pathname={this.props.pathname} />
          <SearchBar />
          { this.state.loggedIn ? <RightNavLoggedIn /> : <RightNavLoggedOut /> }
        </nav>
      </div>
    );
  }
});
