const SearchActions = require('../../actions/search_actions');
const PlayerActions = require('../../actions/player_actions');
const SearchResultStore = require('../../stores/search_result_store');
const SearchResult = require('./search_result');
const hashHistory = require('react-router').hashHistory;
const debounce = require('../../util/debounce');

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

    // create debounced search function
    this._debouncedSearch = debounce(this._makeSearchRequest, 750);
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
    this._debouncedSearch(_query);
  },
  _makeSearchRequest (query) {
    if (!query) {
      SearchActions.hideResults();
    } else {
      SearchActions.showResults();
      SearchActions.searchTracks(query, NUM_RESULTS);
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
    this._debouncedSearch("");
    SearchActions.hideResults();
    hashHistory.push(`/results/${_query}`);
  },
  _handleResize (e) {
    this.setState({resultTextWidth: resultTextWidth()});
  },
  _chooseResult (track) {
    $('#search-input').val("");
    SearchActions.hideResults();
    const q = `${track.title} - ${track.artists[0]}`;
    hashHistory.push(`/results/${q}`);
  },
  render () {
    return (
      <div className="nav-bar-center">
        <form onSubmit={this._onSubmit} id="search-form">
          <input id="search-input"
                 type="text"
                 autoComplete="off"
                 placeholder="Search for Tracks, Albums, or Artists..."
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
                                     onClick={this._chooseResult}
                                     type="search-result"/>;
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
