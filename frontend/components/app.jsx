const React = require('react');
const NavBar = require('./nav_bar');
const Player = require('./player');

module.exports = React.createClass({
  render () {
    return (
      <div>
        <NavBar pathname={this.props.location.pathname}/>
        <div className='main-content'>
          {this.props.children}
        </div>
        <Player />
      </div>
    );
  }
});
