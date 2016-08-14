const React = require('react');
const TrackIndexItem = require('./tracks/track_index_item');
const PlayerActions = require('../actions/player_actions');
const MINWIDTH = 990;
const ALBUMWIDTH = 225;
const OFFSET = 0.9;

const Carousel = React.createClass({
  getInitialState() {
    let category = this.props.category.split(" ").join("-");
    category = category.replace(new RegExp("(\\.|'|!)", "g"), "");
    return ({startIndex: 0, animationState: 'STILL', category: category});
  },

  tracks () {
    let seen = [];
    this.props.tracks.forEach((track) => {
      seen.push(<TrackIndexItem key={track.storeId}
                                track={track}
                                indexType="SEARCH"/>);
    });
    return seen;
  },

  _playAll () {
    PlayerActions.playTracks(this.props.tracks);
  },
  _shuffleAll () {
    PlayerActions.playShuffledTracks(this.props.tracks);
  },

  setStillState(direction) {
    let startIndex = this.determineStartIndex(direction);
    this.setState({startIndex: startIndex, animationState: 'STILL'});
    this.transformBack(direction);
  },

  determineStartIndex(direction) {
    let result = 0;
    switch(direction) {
      case('RIGHT'):
        if (this.state.startIndex + 4 === this.props.tracks.length) {
          result = 0;
        } else {
          result = this.state.startIndex + 4;
        }
        break;
      case('LEFT'):
        if (this.state.startIndex === 0) {
          result = this.props.tracks.length-4;
        } else {
          result = this.state.startIndex - 4;
        }
        break;
      }
    return result;
  },

  _panRight(e) {
    e.preventDefault();
    if (this.state.animationState !== "STILL") {
      return;
    }
    this.setState({animationState: 'RIGHT'}, this._transform);
  },

  transformBack(direction) {
    let cssSettings = {transform: `translateX(0px)`,
                      transition: "transform 0s"};
    $('.carousel-tracks').css(cssSettings);
  },

  _highlightArrows() {
    let style = {color: "#25B7E8", opacity: 1};
    $(`#${this.state.category}-arrow-left`).css(style);
    $(`#${this.state.category}-arrow-right`).css(style);
  },

  _unhighlightArrows() {
    let style = {color: "#a9a9a9", opacity: 0.5};
    $(`#${this.state.category}-arrow-left`).css(style);
    $(`#${this.state.category}-arrow-right`).css(style);
  },


  _panLeft(e) {
    e.preventDefault();
    if (this.state.animationState !== "STILL") {
      return;
    }
    this.setState({animationState: 'LEFT'}, this._transform);
  },

  _transform() {
    switch(this.state.animationState) {
      case("LEFT"):
        let translation = (window.innerWidth * OFFSET);
        if (translation < MINWIDTH ) {
          translation = MINWIDTH;
        }
        let cssSettings = {transform: `translateX(${translation}px)`,
                        transition: "transform 1s"};
        $(`#${this.state.category}`).css(cssSettings);
        setTimeout(this.setStillState.bind(this, 'LEFT'), 1000);
        break;
      case("RIGHT"):
        translation = -window.innerWidth * OFFSET;
        if (translation > -MINWIDTH ) {
          translation = -MINWIDTH;
        }
        cssSettings = {transform: `translateX(${translation}px)`,
                      transition: "transform 1s"};
        $(`#${this.state.category}`).css(cssSettings);
        setTimeout(this.setStillState.bind(this, 'RIGHT'), 1000);
        break;
    }
  },

  rowFetcher(direction, tracks) {
    let tracksToShow = 0;
    switch(direction) {

      case('LEFT'):
        if (this.state.startIndex === 0) {
          let frontPiece = tracks.slice(tracks.length-4, tracks.length);
          let backPiece = tracks.slice(this.state.startIndex, this.state.startIndex + 4);
          tracksToShow = (frontPiece).concat(backPiece);
        } else {
          tracksToShow = (tracks.slice(this.state.startIndex-4, this.state.startIndex + 4));
        }
        break;
      case('RIGHT'):
        if (this.state.startIndex === tracks.length-4) {
          let frontPiece = tracks.slice(this.state.startIndex, this.state.startIndex + 4);
          let backPiece = tracks.slice(0, 4);
          tracksToShow = (frontPiece).concat(backPiece);
        } else {
          tracksToShow = (tracks.slice(this.state.startIndex, this.state.startIndex + 8));
        }
        break;
    }
    return tracksToShow;

  },

  fillCarousel (tracks, cb) {
    let transformStyle = {};
    if (tracks.length) {
      let tracksToShow = [];
      switch(this.state.animationState) {
        case('STILL'):
          tracksToShow = tracks.slice(this.state.startIndex, this.state.startIndex+4);
          break;
        case('LEFT'):
          tracksToShow = this.rowFetcher('LEFT', tracks);
          break;
        case('RIGHT'):
          tracksToShow = this.rowFetcher('RIGHT', tracks);
          break;
        }
      return (
        <div className='carousel'>
          <div className='left-arrow-container'>
            <i className="glyphicon glyphicon-chevron-left left-arrow" id={`${this.state.category}-arrow-left`} onClick={this._panLeft}></i>
          </div>
          <div className='carousel-container'>
            <div className={`carousel-tracks ${this.state.animationState}`} id={this.state.category}>{tracksToShow}</div>
          </div>
          <div className='right-arrow-container'>
            <i className="glyphicon glyphicon-chevron-right right-arrow" onClick={this._panRight} id={`${this.state.category}-arrow-right`}></i>
          </div>
        </div>);
    } else {
        return <div></div>;
    }
},

  render () {
    let title;
    if (this.props.category === "MOST_LIKED") {
      title = "Trending";
    } else if (this.props.category === "MOST_RECENT") {
      title = "Recent";
    } else {
      title = this.props.category.toLowerCase().split(new RegExp("_| ")).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    let tracks = this.tracks();
    let filteredTracks = this.fillCarousel(tracks);
    return (
      <div className="carousel-header" onMouseEnter={this._highlightArrows} onMouseLeave={this._unhighlightArrows} id={this.props.rowIndex}>
        <div className="search-results-header">
          <p>{title}</p>
        </div>
        <div className="play-buttons">
          <button className="btn btn-primary btn-lg"
                  onClick={this._playAll}>Play all</button>
          <button className="btn btn-primary btn-lg"
                  onClick={this._shuffleAll}>Shuffle all</button>
        </div>
        {filteredTracks}
      </div>
    );
  }
});

module.exports = Carousel;
