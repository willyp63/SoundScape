const React = require('react');

const SessionActions = require('../../actions/session_actions');
const SessionStore = require('../../stores/session_store');
const hashHistory = require('react-router').hashHistory;
const ErrorActions = require('../../actions/error_actions');
const ModalActions = require('../../actions/modal_actions');

module.exports = React.createClass({
  _upload (e) {
    e.preventDefault();
    // show track form
    ErrorActions.removeErrors();
    ModalActions.show("TRACK", "NEW");
  },
  _logout (e) {
    e.preventDefault();
    SessionActions.logout();
    // redirect to root
    hashHistory.push('/');
  },
  _editProfile (e) {
    e.preventDefault();
    ErrorActions.removeErrors();
    ModalActions.show("USER", "UPDATE");
  },
  render () {
    return (
      <div className="nav-bar-right">
        <ul>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <img className="profile-badge"
                   src={SessionStore.currentUser().picture_url}
                   width="35" height="35"/>
              <i className="glyphicon glyphicon-triangle-bottom profile-carrot"></i>
            </a>
            <ul className="dropdown-menu">
              <li>{SessionStore.currentUser().username}</li>
              <li role="separator" className="divider"></li>
              <li onClick={this._editProfile}>Edit Profile</li>
              <li onClick={this._logout}>Log Out</li>
            </ul>
          </li>
          <li onClick={this._upload}>Upload</li>
        </ul>
      </div>
    );
  }
});
