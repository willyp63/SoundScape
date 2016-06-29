const React = require('react');
const NavBar = require('./nav_bar');

module.exports = React.createClass({
  render () {
    return (
      <div>
        <NavBar />
        {this.props.children}
      </div>
    );
  }
});
