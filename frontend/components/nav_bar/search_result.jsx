const React = require('react');

module.exports = React.createClass({
  _onClick (e) {
    e.stopPropagation();
    this.props.onClick(this.props.track);
  },
  render () {
    let text = this.props.track.title;
    if (this.props.track.artist) {
      text += ` - ${this.props.track.artist}`;
    }
    if (getWidthOfText(text) > this.props.textWidth) {
      text = shortenText(text, this.props.textWidth);
    }
    return (
      <li onClick={this._onClick} className="cf">
        <p>{text}</p>
        <img src={this.props.track.image_url} width="40" height="40"/>
      </li>
    );
  }
});

const resultFont = '18px sans-serif';

function getWidthOfText (text) {
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  ctx.font = resultFont;
  return ctx.measureText(text).width;
}

function shortenText (text, width) {
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  ctx.font = resultFont;

  let totalWidth = 0;
  let shortened = "";
  let i = 0;
  while (totalWidth < width) {
    const letter = text.charAt(i++);
    shortened += letter;
    totalWidth += ctx.measureText(letter).width;
  }

  return `${shortened.slice(0, i - 3)}...`;
}
