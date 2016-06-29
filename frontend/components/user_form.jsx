const React = require('react');
const SessionActions = require('../actions/session_actions');
const ErrorStore = require('../stores/error_store');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {errors: undefined, user: {username: "", password: ""}};
  },
  componentDidMount () {
    _listeners.push(ErrorStore.addListener(this._errorChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  componentWillReceiveProps (newProps) {
    // clear fields before being shown
    this.setState({errors: undefined, user: {username: "", password: ""}});
  },
  _onChange (e) {
    const newUser = this.state.user;
    newUser[e.target.id] = e.target.value;
    this.setState({user: newUser});
  },
  _errorChange () {
    this.setState({errors: ErrorStore.errors()});
  },
  _onSubmit (e) {
    e.preventDefault();
    if (this.props.formType === 'login') {
      SessionActions.login(this.state.user);
    } else if (this.props.formType === 'signup') {
      SessionActions.signup(this.state.user);
    }
    // clear password
    this.setState({user: {username: this.state.user.username, password: ""}});
  },
  render () {
    let formTitle;
    if (this.props.formType === 'login') {
      formTitle = 'Log In';
    } else if (this.props.formType === 'signup') {
      formTitle = 'Sign Up';
    }

    return (
      <div id="userModal" className="modal fade" role="dialog">
        <div className="modal-dialog">

          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <h4 className="modal-title">{formTitle}</h4>
            </div>
            <div className="modal-body text-center">
              <form onSubmit={this._onSubmit}>
                <label for="username">Username</label>
                <input type="text" id="username"
                       value={this.state.user.username}
                       onChange={this._onChange} />

                <label for="password">Password</label>
                <input type="password" id="password"
                       value={this.state.user.password}
                       onChange={this._onChange} />
                 {this.state.errors ?
                   <ul className="list-unstyled">{
                     this.state.errors.map(errorMsg => {
                       return <li key={errorMsg} className="error-msg">{errorMsg}</li>;
                     })
                   }</ul> : ""
                 }
                 <input type="submit" value={formTitle} className="btn btn-default"/>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
