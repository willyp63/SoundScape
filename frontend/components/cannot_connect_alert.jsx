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
            <form className="cannot-connect-form">
              <div className="cannot-connect-upper">
                <p className="cannot-connect-body">It looks like something is interfering with our streaming service. VPN services, availible in the Chrome extension store, tend to solve this issue.</p>
                <i className="glyphicon glyphicon-fire cannot-connect-icon"></i>
              </div>
              <ul>
                <li>
                  <a href="https://chrome.google.com/webstore/detail/zenmate-vpn-best-cyber-se/fdcgdnkidjaadafnichfpabhfomcebme?hl=en">
                    ZenMate
                    <img></img>
                  </a>
                </li>
                <li>
                  <a href="https://chrome.google.com/webstore/detail/hotspot-shield-free-vpn-p/nlbejmccbhkncgokjcmghpfloaajcffj?hl=en">
                    Hotspot Shield
                  </a>
                </li>
              </ul>
            </form>
          </div>
        </div>
      </div>
    );
  }
});
