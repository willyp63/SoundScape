module.exports = React.createClass({
  _highlightMinus (e) {
    $(e.target).addClass('highlighted');
  },
  _unhighlightMinus (e) {
    $(e.target).removeClass('highlighted');
  },
  _onClick (e) {
    e.stopPropagation();
    this.props.onClick(this.props.track);
  },
  _onRemove (e) {
    e.stopPropagation();
    this.props.onRemove(this.props.track);
  },
  minus_sign () {
    if (this.props.type === "search-result") {
     return <div></div>;
    } else {
     return <i className="glyphicon glyphicon-minus minus-icon" onClick={this._onRemove} onMouseEnter={this._highlightMinus} onMouseLeave={this._unhighlightMinus}/>;
    }
  },
  render () {
    let text = this.props.track.title;
    if (this.props.track.artists && this.props.track.artists[0]) {
      text = `${this.props.track.artists[0]} - ${text}`;
    }
    if (getWidthOfText(text) > this.props.textWidth) {
      text = shortenText(text, this.props.textWidth);
    }
    return (
      <li onClick={this._onClick} className="cf">
       {this.minus_sign()}
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
