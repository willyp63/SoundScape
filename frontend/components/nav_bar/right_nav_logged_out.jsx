const React = require('react');
const ErrorActions = require('../../actions/error_actions');

module.exports = React.createClass({
  _signup (e) {
    e.preventDefault();
    // show signup form
    ErrorActions.removeErrors();
    $("#SIGNUP-MODAL").modal("show");
  },
  _login (e) {
    e.preventDefault();
    // show login form
    ErrorActions.removeErrors();
    $("#LOGIN-MODAL").modal("show");
  },
  render () {
    return (
      <div className="nav-bar-right">
        <ul>
          <li onClick={this._signup}>Sign Up</li>
          <li onClick={this._login}>Log In</li>
        </ul>
      </div>
    );
  }
});
