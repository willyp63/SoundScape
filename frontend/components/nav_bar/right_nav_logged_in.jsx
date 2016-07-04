const React = require('react');

const SessionActions = require('../../actions/session_actions');
const hashHistory = require('react-router').hashHistory;
const ErrorActions = require('../../actions/error_actions');

module.exports = React.createClass({
  _upload (e) {
    e.preventDefault();
    // show track form
    ErrorActions.removeErrors();
    $("#NEW-TRACK-MODAL").modal("show");
  },
  _logout (e) {
    e.preventDefault();
    SessionActions.logout();
    // redirect to root
    hashHistory.push('/');
  },
  render () {
    return (
      <div className="nav-bar-right">
        <ul>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <img className="profile-badge"
                   src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467216318/sample_yeytpq.jpg"
                   width="35" height="35"/>
              <i className="glyphicon glyphicon-triangle-bottom profile-carrot"></i>
            </a>
            <ul className="dropdown-menu">
              <li>Action</li>
              <li>Another action</li>
              <li>Something else here</li>
              <li role="separator" className="divider"></li>
              <li onClick={this._logout}>Log Out</li>
            </ul>
          </li>
          <li onClick={this._upload}>Upload</li>
        </ul>
      </div>
    );
  }
});
