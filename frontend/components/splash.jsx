const React = require('react');
const SearchActions = require('../actions/search_actions');
const TrackIndex = require('./tracks/track_index');
const randomQueries = require('../constants/random_queries');

const INITIAL_REQUEST_SIZE = 40;
const ADDITIONAL_REQUEST_SIZE = 20;

let _randomQuery;

module.exports = React.createClass({
  componentWillMount () {
    const i = Math.floor(Math.random() * randomQueries.length);
    _randomQuery = "a";
  },
  _fetchInitialTracks () {
    SearchActions.fetchResults(_randomQuery, INITIAL_REQUEST_SIZE, 0);
  },
  _fetchMoreTracks (offset) {
    SearchActions.fetchResults(_randomQuery, ADDITIONAL_REQUEST_SIZE, offset);
  },
  _demoLogin () {
    console.log("demo login!");
  },
  render () {
    return (
      <div>
        <div className="banner">
          <img src="http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467765103/banner_g9ggmj.jpg"/>
          <span className="tag-line">Sample Millions of Tracks</span>
          <button className="btn btn-success" onClick={this._demoLogin}>Try It Out!</button>
        </div>
        <TrackIndex fetchInitialTracks={this._fetchInitialTracks}
                    fetchMoreTracks={this._fetchMoreTracks}
                    indexType="SPLASH" />
      </div>
    );
  }
});

function randomLetters (n) {
  let letters = "";
  for (let i = 0; i < n; i++) {
    const charCode = 97 + Math.floor(Math.random() * 26);
    letters += String.fromCharCode(charCode);
  }
  return letters;
};
