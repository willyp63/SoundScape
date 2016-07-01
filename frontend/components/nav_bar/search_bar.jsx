const React = require('react');
const SearchActions = require('../../actions/search_actions');
const SearchResultStore = require('../../stores/search_result_store');
const SearchResult = require('./search_result');
const hashHistory = require('react-router').hashHistory;

const NUM_RESULTS = 10;

let _listeners = [];
let _query = "";

module.exports = React.createClass({
  getInitialState () {
    return {results: SearchResultStore.dropDownResults(),
            showing: SearchResultStore.showing()};
  },
  componentWillMount () {
    _listeners.push(SearchResultStore.addListener(this._resultsChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _resultsChange () {
    this.setState({results: SearchResultStore.dropDownResults(),
                   showing: SearchResultStore.showing()});
  },
  _onChange (e) {
    _query = e.target.value;
    if (e.target.value) {
      SearchActions.showSearchResults();
      SearchActions.searchTracksInDropDown(e.target.value, NUM_RESULTS);
    } else {
      SearchActions.hideSearchResults();
    }
  },
  _onClick (e) {
    if ($('#search-input').val()) {
      SearchActions.showSearchResults();
    }
    // dont allow app to clear search results
    e.stopPropagation();
  },
  _onSubmit (e) {
    e.preventDefault();
    $('#search-input').val("");
    SearchActions.hideSearchResults();
    hashHistory.push(`/search/${_query}`);
  },
  render () {
    return (
      <div className="nav-bar-center">
        <form onSubmit={this._onSubmit}>
          <input id="search-input"
                 type="text"
                 autoComplete="off"
                 placeholder="Search for Tracks..."
                 onChange={this._onChange}
                 onClick={this._onClick}>
          </input>
          <i className="glyphicon glyphicon-search"></i>
        </form>
        <div className="dropdown open">
          {this.state.showing && this.state.results.length ?
            <ul className="dropdown-menu search-results">{
              this.state.results.map(track => {
                return <SearchResult key={track.id} track={track} />;
              })
            }</ul> :
            ""}
        </div>
      </div>
    );
  }
});
