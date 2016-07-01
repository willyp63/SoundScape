const React = require('react');
const NavBar = require('./nav_bar/nav_bar');
const Player = require('./player');
const SearchActions = require('../actions/search_actions');

module.exports = React.createClass({
  _onClick () {
    SearchActions.hideSearchResults();
  },
  render () {
    return (
      <div onClick={this._onClick}>
        <NavBar pathname={this.props.location.pathname}/>
        <div className='main-content'>
          {this.props.children}
        </div>
        <Player />
      </div>
    );
  }
});
