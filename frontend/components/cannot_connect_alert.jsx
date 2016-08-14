const ModalActions = require('../actions/modal_actions');

module.exports = React.createClass({
  _closeModal () {
    ModalActions.hide();
  },
  render () {
    return (
      <div id='INFO-CANNOT_CONNECT-MODAL' className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content cf">
            <div className="form-header cf">
              <button className="close" onClick={this._closeModal}>&times;</button>
              <p className="modal-title">Unable to Connect</p>
            </div>
            <form className="cannot-connect-form cf">
              <div className="alert-col-2 cf">
                <p className="cannot-connect-body">It looks like something is interfering with our streaming service. VPN services, availible in the Chrome extension store, tend to solve this issue.</p>
                <ul>
                  <li>
                    <a href="https://chrome.google.com/webstore/detail/zenmate-vpn-best-cyber-se/fdcgdnkidjaadafnichfpabhfomcebme?hl=en">
                      <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1471202747/zenmate_uz5psp.jpg" alt="ZenMate"></img>
                      ZenMate
                      <img></img>
                    </a>
                  </li>
                  <li>
                    <a href="https://chrome.google.com/webstore/detail/hotspot-shield-free-vpn-p/nlbejmccbhkncgokjcmghpfloaajcffj?hl=en">
                      <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1471202747/hotspot_shield_pbdtyg.jpg" alt="Hotspot Shield"></img>
                      Hotspot Shield
                    </a>
                  </li>
                </ul>
              </div>
              <div className="alert-col-1 cf">
                <i className="glyphicon glyphicon-alert"></i>
              </div>
              <div className="alert-col-3 cf">
                <button onClick={this._closeModal} className="btn btn-success">Ok</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
});
