const React = require('react');
const hashHistory = require('react-router').hashHistory;

module.exports = React.createClass({
  getInitialState () {
    return {selectedItem: "tracks"};
  },
  _navItemClick (e) {
    this.setState({selectedItem: e.target.id});
    hashHistory.push(`/collection/${e.target.id}`);
  },
  render () {
    const si = this.state.selectedItem;
    return (
      <div>
        <ul className="my-navbar">
          <li id="tracks"
              className={si === "tracks" ? "selected" : ""}
              onClick={this._navItemClick}>
              Tracks
          </li>
          <li id="likes"
              className={si === "likes" ? "selected" : ""}
              onClick={this._navItemClick}>
              Likes
          </li>
        </ul>
        {this.props.children}
      </div>
    );
  }
});
