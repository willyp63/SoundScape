const React = require('react');
const ErrorStore = require('../stores/error_store');
const TrackActions = require('../actions/track_actions');
const TrackStore = require('../stores/track_store');

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {errors: undefined, track: {title: "",
                                       image_url: "",
                                       audio_url: ""}};
  },
  componentDidMount () {
    _listeners.push(ErrorStore.addListener(this._receiveErrors));
    _listeners.push(TrackStore.addListener(this._trackChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _trackChange () {
    // close modal when new track is recieved
    $("#TRACK-MODAL").modal("hide");
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
          newTrack.image_url = results[0].secure_url;
          this.setState({track: newTrack});
        }
      }.bind(this)
    );
  },
  _uploadTrack (e) {
    e.preventDefault();
    window.cloudinary.openUploadWidget(
      window.CLOUDINARY_OPTIONS_MP3,
      function (error, results) {
        if (!error) {
          const newTrack = this.state.track;
          newTrack.audio_url = results[0].secure_url;
          this.setState({track: newTrack});
        }
      }.bind(this)
    );
  },
  _onSubmit (e) {
    e.preventDefault();
    TrackActions.postTrack(this.state.track);
  },
  render () {
    return (
      <div id="TRACK-MODAL" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content cf">
            <div className="form-header cf">
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <p className="modal-title">Upload Track</p>
            </div>
            <form onSubmit={this._onSubmit} className="track-form">
              <div className="row">
                <div className="my-col-2 cf">
                  {this.state.track.image_url ?
                    <div className="image-upload-thumbnail">
                      <img src={this.state.track.image_url} />
                    </div> :
                    <div className="image-upload-placeholder">
                      Upload an Image
                    </div>}
                  {this.state.track.audio_url ?
                    <audio id="audio-upload" controls>
                      <source src={this.state.track.audio_url} type="audio/mpeg"/>
                    </audio> :
                    <div className="audio-upload-placeholder">
                      Upload Audio
                    </div>}
                </div>
                <div className="my-col-1 cf">
                  <div className="upload-buttons">
                    <button className="btn btn-primary"
                      onClick={this._uploadImage}>Select Image</button>
                    <button className="btn btn-primary"
                      onClick={this._uploadTrack}>Select Audio</button>
                  </div>
                </div>
              </div>

              <div className="form-field cf">
                <label for="title">Track Title:</label>
                <input type="text" id="title"
                       value={this.state.track.title}
                       onChange={this._titleChange} />
              </div>

               {this.state.errors ?
                 <ul>{
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
    );
  }
});
