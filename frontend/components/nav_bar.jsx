const React = require('react');
const SessionStore = require('../stores/session_store');
const SessionActions = require('../actions/session_actions');

const UserForm = require('./user_form');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {currentUser: SessionStore.currentUser(), formType: ""};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _sessionChange () {
    const currentUser = SessionStore.currentUser();
    this.setState({currentUser: currentUser});
    if (currentUser) {
      $("#userModal").modal("hide");
    }
  },
  _upload (e) {
    e.preventDefault();
    window.cloudinary.openUploadWidget(
      window.CLOUDINARY_OPTIONS,
      function (error, results) {
        if (!error) {
          // do something
        }
      }.bind(this)
    );
  },
  _signup (e) {
    e.preventDefault();
    this.setState({formType: "signup"}, function () {
      $("#userModal").modal("show");
    });
  },
  _login (e) {
    e.preventDefault();
    this.setState({formType: "login"}, function () {
      $("#userModal").modal("show");
    });
  },
  _logout (e) {
    e.preventDefault();
    SessionActions.logout();
  },
  render () {
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" id="logo" href="#">SoundScape</a>
            </div>

            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <form className="navbar-form navbar-left" role="search">
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Search"/>
                </div>
                <button type="submit" className="btn btn-default">
                  <i className="glyphicon glyphicon-search"></i>
                </button>
              </form>
              { this.state.currentUser ?
                <ul className="nav navbar-nav navbar-right">
                  <li className="my-nav-item"><a onClick={this._upload} href="#">Upload</a></li>
                  <li className="dropdown my-nav-item">
                    <a href="#" className="dropdown-toggle"
                                data-toggle="dropdown"
                                role="button"
                                aria-haspopup="true"
                                aria-expanded="false">
                      {this.state.currentUser.username}
                      <span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu">
                      <li><a href="#">Action</a></li>
                      <li><a href="#">Another action</a></li>
                      <li><a href="#">Something else here</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a onClick={this._logout} href="#">Log Out</a></li>
                    </ul>
                  </li>
                </ul> :
                <ul className="nav navbar-nav navbar-right">
                  <li><a href="#"
                         onClick={this._signup}>Sign Up</a></li>
                  <li><a href="#"
                         onClick={this._login}>Log In</a></li>
                </ul>
              }
            </div>
          </div>
        </nav>
        <UserForm formType={this.state.formType}/>
      </div>
    );
  }
});
