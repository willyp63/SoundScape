const React = require('react');

const SessionStore = require('../../stores/session_store');
const ModalStore = require('../../stores/modal_store');
const ModalForm = require('../../stores/modal_store');

const LeftNav = require('./left_nav');
const RightNavLoggedIn = require('./right_nav_logged_in');
const RightNavLoggedOut = require('./right_nav_logged_out');
const SearchBar = require('./search_bar');
const UserForm = require('../user_form');
const TrackForm = require('../tracks/track_form');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {loggedIn: SessionStore.loggedIn(), modalType: "", formType: ""};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
    _listeners.push(ModalForm.addListener(this._modalChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _sessionChange () {
    this.setState({loggedIn: SessionStore.loggedIn()});
  },
  _modalChange () {
    if (!ModalStore.modalType()) {
      $(`#${this.state.formType}-${this.state.modalType}-MODAL`).modal('hide');
    }
    this.setState({modalType: ModalStore.modalType(),
              formType: ModalStore.formType(),
              track: ModalStore.track()}, function () {
      $(`#${this.state.formType}-${this.state.modalType}-MODAL`).modal('show');
    });
  },
  render () {
    let modal = "";
    if (this.state.modalType === "TRACK") {
      if (this.state.track) {
        modal = <TrackForm formType={this.state.formType} track={ModalStore.track()} />;
      } else {
        modal = <TrackForm formType={this.state.formType} />;
      }
    } else if (this.state.modalType === "USER") {
      modal = <UserForm formType={this.state.formType} />;
    }
    return (
      <div>
        <nav className="nav-bar">
          <LeftNav pathname={this.props.pathname} />
          <SearchBar />
          { this.state.loggedIn ? <RightNavLoggedIn /> : <RightNavLoggedOut /> }
        </nav>
        {modal}
      </div>
    );
  }
});
