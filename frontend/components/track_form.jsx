const React = require('react');
const ErrorStore = require('../stores/error_store');
const TrackActions = require('../actions/track_actions');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {errors: undefined,
            track: {title: this.props.track.title, imageUrl: ""}};
  },
  componentDidMount () {
    _listeners.push(ErrorStore.addListener(this._receiveErrors));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  componentWillReceiveProps (newProps) {
    // reset fields before being shown
    this.setState({errors: undefined,
            track: {title: newProps.track.title, imageUrl: ""}});
  },
  _titleChange (e) {
    const newTrack = this.state.track;
    newTrack.title = e.target.value;
    this.setState({track: newTrack});
  },
  _receiveErrors () {
    // clear password
    this.setState({errors: ErrorStore.errors()});
  },
  _uploadImage (e) {
    e.preventDefault();
    window.cloudinary.openUploadWidget(
      window.CLOUDINARY_OPTIONS_IMG,
      function (error, results) {
        if (!error) {
          const newTrack = this.state.track;
          newTrack.imageUrl = results[0].secure_url;
          this.setState({track: newTrack});
        }
      }.bind(this)
    );
  },
  _onSubmit (e) {
    e.preventDefault();
    debugger
    const track = {
      title: this.state.track.title,
      audio_url: this.props.track.audioUrl,
      image_url: this.state.track.imageUrl
    };
    TrackActions.postTrack(track);
  },
  render () {
    const minutes = Math.floor(this.props.track.duration / 60);
    const seconds = Math.floor(this.props.track.duration % 60);
    return (
      <div id="trackModal" className="modal fade" role="dialog">
        <div className="modal-dialog">

          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <h4 className="modal-title">Upload Track</h4>
            </div>
            <div className="modal-body text-center">
              <form onSubmit={this._onSubmit} className="track-form">
                <label for="upload-image">Track Image</label>
                <div id="upload-image" className="thumbnail upload-image-thumbnail">
                  <img src={this.state.track.imageUrl} />
                </div>
                <button className="btn btn-primary"
                        onClick={this._uploadImage}>Select Image</button>

                <label for="title">Track Title</label>
                <input type="text" id="title"
                       value={this.state.track.title}
                       onChange={this._titleChange} />

                <label>Track Duration: {`${minutes}:${seconds}`}</label>
                 {this.state.errors ?
                   <ul className="list-unstyled">{
                     this.state.errors.map(errorMsg => {
                       return <li key={errorMsg} className="error-msg">{errorMsg}</li>;
                     })
                   }</ul> : ""
                 }
                 <input type="submit" value="Upload Track" className="btn btn-success"/>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
