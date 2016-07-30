const ErrorActions = require('../../actions/error_actions');
const ModalActions = require('../../actions/modal_actions');

module.exports = React.createClass({
  _signup (e) {
    e.preventDefault();
    // show signup form
    ErrorActions.removeErrors();
    ModalActions.show("USER", "SIGNUP");
  },
  _login (e) {
    e.preventDefault();
    // show login form
    ErrorActions.removeErrors();
    ModalActions.show("USER", "LOGIN");
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
