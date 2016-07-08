const React = require('react');
const ErrorStore = require('../../stores/error_store');
const TrackActions = require('../../actions/track_actions');
const ModalActions = require('../../actions/modal_actions');
const CLOUDINARY_IMAGE_OPTIONS = require('../../constants/cloudinary').IMAGE_OPTIONS;
const CLOUDINARY_AUDIO_OPTIONS = require('../../constants/cloudinary').AUDIO_OPTIONS;

const _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    if (this.props.track) {
      return {errors: [], track: {title: this.props.track.title,
                            image_url: this.props.track.image_url,
                            audio_url: this.props.track.audio_url}};
    } else {
      return {errors: [], track: {title: "", image_url: "", audio_url: ""}};
    }
  },
  componentWillMount () {
    _listeners.push(ErrorStore.addListener(this._receiveErrors));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _closeModal () {
    ModalActions.hide("TRACK", this.props.formType);
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
      CLOUDINARY_IMAGE_OPTIONS,
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
      CLOUDINARY_AUDIO_OPTIONS,
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
    if (this.props.formType === "NEW") {
      TrackActions.postTrack(this.state.track);
    } else {
      const track = {id: this.props.track.id,
              storeId: this.props.track.storeId,
              liked: this.props.track.liked,
              title: this.state.track.title,
              image_url: this.state.track.image_url,
              audio_url: this.state.track.audio_url};
      TrackActions.updateTrack(track);
    }
  },
  _onDelete (e) {
    e.preventDefault();
    TrackActions.deleteTrack(this.props.track);
  },
  render () {
    return (
      <div id={`${this.props.formType}-TRACK-MODAL`} className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content cf">
            <div className="form-header cf">
              <button type="button" className="close" onClick={this._closeModal}>&times;</button>
              <p className="modal-title">{this.props.formType === "NEW" ? "New" : "Edit"} Track</p>
            </div>
            <form onSubmit={this._onSubmit} className="track-form">
              <div className="cf">
                <div className="my-col-2 cf">
                  {this.state.track.image_url ?
                    <div className="image-upload-thumbnail">
                      <img src={this.state.track.image_url} width="225" height="225"/>
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
                <label for="title">Title:</label>
                <input type="text" id="title"
                       value={this.state.track.title}
                       onChange={this._titleChange} />
              </div>

              {this.state.errors ?
                <ul className="error-messages">{
                  this.state.errors.map(errorMsg => {
                    return (<li key={errorMsg}>
                             <i className="glyphicon glyphicon-remove" />
                             {errorMsg}
                           </li>);
                  })
                }</ul> : ""
              }

               {this.props.formType === "UPDATE" ?
                 <button className="btn btn-danger" onClick={this._onDelete}>
                   Delete Track
                 </button> :
                 ""}
               <input type="submit"
                      value={`${this.props.formType === "NEW" ? "Create" : "Update"} Track`}
                      className="btn btn-success"/>
            </form>
          </div>
        </div>
      </div>
    );
  }
});
