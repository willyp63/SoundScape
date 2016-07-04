const React = require('react');
const SessionActions = require('../actions/session_actions');
const SessionStore = require('../stores/session_store');
const ErrorStore = require('../stores/error_store');
const CLOUDINARY_IMAGE_OPTIONS = require('../constants/cloudinary').IMAGE_OPTIONS;

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {errors: undefined, user: {username: "", password: "", picture_url: ""}};
  },
  componentDidMount () {
    _listeners.push(ErrorStore.addListener(this._receiveErrors));
    _listeners.push(SessionStore.addListener(this._sessionChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _onChange (e) {
    const newUser = this.state.user;
    newUser[e.target.id] = e.target.value;
    this.setState({user: newUser});
  },
  _sessionChange () {
    // close modal if loggin/sign up was successful
    if (SessionStore.currentUser()) {
      $(`#${this.props.formType}-MODAL`).modal('hide');
    }
  },
  _receiveErrors () {
    // clear password
    this.setState({errors: ErrorStore.errors(),
      user: {username: this.state.user.username,
            password: "",
            picture_url: this.state.user.picture_url}});
  },
  _uploadImage (e) {
    e.preventDefault();
    window.cloudinary.openUploadWidget(
      CLOUDINARY_IMAGE_OPTIONS,
      function (error, results) {
        if (!error) {
          const newUser = this.state.user;
          newUser.picture_url = results[0].secure_url;
          this.setState({user: newUser});
        }
      }.bind(this)
    );
  },
  _onSubmit (e) {
    e.preventDefault();
    if (this.props.formType === 'LOGIN') {
      SessionActions.login(this.state.user);
    } else if (this.props.formType === 'SIGNUP') {
      SessionActions.signup(this.state.user);
    }
  },
  render () {
    let formTitle;
    if (this.props.formType === 'LOGIN') {
      formTitle = 'Log In';
    } else if (this.props.formType === 'SIGNUP') {
      formTitle = 'Sign Up';
    }

    return (
      <div id={`${this.props.formType}-MODAL`} className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content cf">
            <div className="form-header cf">
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <p className="modal-title">{formTitle}</p>
            </div>
            <form onSubmit={this._onSubmit}>
              <div className="form-field cf">
                <label for="username">Username:</label>
                <input type="text" id="username"
                       value={this.state.user.username}
                       onChange={this._onChange} />
              </div>

              <div className="form-field cf">
                <label for="password">Password:</label>
                <input type="password" id="password"
                       value={this.state.user.password}
                       onChange={this._onChange} />
              </div>

              {this.props.formType === "SIGNUP" ?
                <div className="cf">
                  <div className="my-col-2 cf">
                    {this.state.user.picture_url ?
                      <div className="image-upload-thumbnail">
                        <img src={this.state.user.picture_url} width="225" height="225"/>
                      </div> :
                      <div className="image-upload-placeholder">
                        Upload an Image
                      </div>}
                  </div>
                  <div className="my-col-1 cf">
                    <div className="upload-buttons">
                      <button className="btn btn-primary"
                        onClick={this._uploadImage}>Select Image</button>
                    </div>
                  </div>
                </div> : ""}

               {this.state.errors ?
                 <ul>{
                   this.state.errors.map(errorMsg => {
                     return <li key={errorMsg} className="error-msg">{errorMsg}</li>;
                   })
                 }</ul> : ""
               }
               <input type="submit" value={formTitle} className="btn btn-success"/>
            </form>
          </div>
        </div>
      </div>
    );
  }
});
