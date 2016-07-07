const React = require('react');
const hashHistory = require('react-router').hashHistory;
const SessionStore = require('../../stores/session_store');
const ErrorActions = require('../../actions/error_actions');

module.exports = React.createClass({
  _linkHome () {
    hashHistory.push('/home');
  },
  _linkCollection () {
    if (!SessionStore.loggedIn()) {
      // show signup form
      ErrorActions.removeErrors();
      $("#SIGNUP-MODAL").modal("show");
    } else {
      hashHistory.push('/collection');
    }
  },
  render () {
    const homeActive = this.props.pathname === "/home";
    const collectionActive = this.props.pathname === "/collection";
    return (
      <div className="nav-bar-left">
        <a className="nav-bar-logo" href="#">
          <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467216317/logo_sridrs.png"
               alt="SoundScape Logo"/>
        </a>
        <ul>
          <li className={homeActive ? "active" : ""} onClick={this._linkHome}>Home</li>
          <li className={collectionActive ? "active" : ""} onClick={this._linkCollection}>Collection</li>
        </ul>
      </div>
    );
  }
});
