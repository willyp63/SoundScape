const React = require('react');
const Link = require('react-router').Link;
const hashHistory = require('react-router').hashHistory;
const SessionStore = require('../stores/session_store');
const TrackStore = require('../stores/track_store');
const SessionActions = require('../actions/session_actions');

const UserForm = require('./user_form');
const TrackForm = require('./track_form');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {currentUser: SessionStore.currentUser(), formType: "",
            track: {title: "", audioUrl: "", duration: 0}};
  },
  componentWillMount () {
    _listeners.push(SessionStore.addListener(this._sessionChange));
    _listeners.push(TrackStore.addListener(this._tracksChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _sessionChange () {
    const currentUser = SessionStore.currentUser();
    this.setState({currentUser: currentUser});

    // close login/signup form if a new session was created
    if (currentUser) {
      $("#userModal").modal("hide");
    }
  },
  _tracksChange () {
    $("#trackModal").modal("hide");
  },
  _upload (e) {
    e.preventDefault();
    window.cloudinary.openUploadWidget(
      window.CLOUDINARY_OPTIONS_MP3,
      function (error, results) {
        if (!error) {
          const track = {
            title: results[0].original_filename,
            duration: results[0].duration,
            audioUrl: results[0].secure_url
          };
          this._showTrackForm(track);
        }
      }.bind(this)
    );
  },
  _showTrackForm (track) {
    this.setState({track: track}, function () {
      $("#trackModal").modal("show");
    });
  },
  _signup (e) {
    e.preventDefault();
    // show signup form
    this.setState({formType: "signup"}, function () {
      $("#userModal").modal("show");
    });
  },
  _login (e) {
    e.preventDefault();
    // show login form
    this.setState({formType: "login"}, function () {
      $("#userModal").modal("show");
    });
  },
  _logout (e) {
    e.preventDefault();
    SessionActions.logout();
    hashHistory.push('/');
  },
  render () {
    const homeActive = this.props.pathname === "/";
    const collectionActive = this.props.pathname.match(/\/collection.*/);
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand" id="logo" href="#">
              <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467216317/logo_sridrs.png"
                   alt="SoundScape logo"/>
            </a>
            <ul className="nav navbar-nav">
              <li className={homeActive ? "active" : ""}><Link to="/">Home</Link></li>
              <li className={collectionActive ? "active" : ""}><Link to="/collection/tracks">Collection</Link></li>
            </ul>
            <form className="navbar-form navbar-left" role="search">
              <div className="form-group">
                <input type="text" className="form-control search-input" placeholder="Search for Tracks">
                </input>
              </div>
              <i className="glyphicon glyphicon-search search-button"></i>
            </form>
            { this.state.currentUser ?
              <ul className="nav navbar-nav navbar-right">
                <li><a onClick={this._upload} href="#">Upload</a></li>
                <li className="dropdown porfile-link">
                  <a href="#" className="dropdown-toggle"
                              data-toggle="dropdown"
                              role="button"
                              aria-haspopup="true"
                              aria-expanded="false">
                    <img className="profile-badge"
                         src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467216318/sample_yeytpq.jpg"/>
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
                <li><a href="#" onClick={this._signup}>Sign Up</a></li>
                <li><a href="#" onClick={this._login}>Log In</a></li>
              </ul>
            }
          </div>
        </nav>
        <UserForm formType={this.state.formType}/>
        <TrackForm track={this.state.track}/>
      </div>
    );
  }
});
