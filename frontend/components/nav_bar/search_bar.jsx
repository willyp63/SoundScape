const React = require('react');
const SearchActions = require('../../actions/search_actions');
const PlayerActions = require('../../actions/player_actions');
const SearchResultStore = require('../../stores/search_result_store');
const SearchResult = require('./search_result');
const hashHistory = require('react-router').hashHistory;

const NUM_RESULTS = 10;

let _listeners = [];
let _query = "";

module.exports = React.createClass({
  getInitialState () {
    return {results: SearchResultStore.results(),
            showing: SearchResultStore.showing(),
            resultTextWidth: 0};
  },
  componentWillMount () {
    window.addEventListener('resize', this._handleResize);
    _listeners.push(SearchResultStore.addListener(this._resultsChange));
  },
  componentDidMount () {
    this.setState({resultTextWidth: resultTextWidth()});
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _resultsChange () {
    this.setState({results: SearchResultStore.results(),
                   showing: SearchResultStore.showing()});
  },
  _onChange (e) {
    _query = e.target.value;
    if (e.target.value) {
      SearchActions.showResults();
      SearchActions.searchTracks(e.target.value, NUM_RESULTS);
    } else {
      SearchActions.hideResults();
    }
  },
  _onClick (e) {
    if ($('#search-input').val()) {
      SearchActions.showResults();
    }
    // dont allow app to clear search results
    e.stopPropagation();
  },
  _onSubmit (e) {
    e.preventDefault();
    $('#search-input').val("");
    SearchActions.hideResults();
    hashHistory.push(`/results/${_query}`);
  },
  _handleResize (e) {
    this.setState({resultTextWidth: resultTextWidth()});
  },
  _playTrack (track) {
    PlayerActions.playTrack(track);
  },
  render () {
    return (
      <div className="nav-bar-center">
        <form onSubmit={this._onSubmit} id="search-form">
          <input id="search-input"
                 type="text"
                 autoComplete="off"
                 placeholder="Search for Tracks..."
                 onChange={this._onChange}
                 onClick={this._onClick}>
          </input>
          <i className="glyphicon glyphicon-search"
             onClick={this._onSubmit}></i>
        </form>
        <div className="dropdown open">
          {this.state.showing && this.state.results.length ?
            <ul className="dropdown-menu search-results">{
              this.state.results.map(track => {
                return <SearchResult key={track.id}
                                     track={track}
                                     textWidth={this.state.resultTextWidth}
                                     onClick={this._playTrack}/>;
              })
            }</ul> :
            ""}
        </div>
      </div>
    );
  }
});

function resultTextWidth () {
  return $('#search-form').width() - 85;
}
