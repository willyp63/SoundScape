const React = require('react');
const SearchActions = require('../../actions/search_actions');
const SearchResultStore = require('../../stores/search_result_store');
const SearchResult = require('./search_result');

let _listeners = [];

module.exports = React.createClass({
  getInitialState () {
    return {results: SearchResultStore.all(),
            showing: SearchResultStore.showing()};
  },
  componentWillMount () {
    _listeners.push(SearchResultStore.addListener(this._resultsChange));
  },
  componentWillUnmount () {
    _listeners.forEach(listener => listener.remove());
  },
  _resultsChange () {
    this.setState({results: SearchResultStore.all(),
                   showing: SearchResultStore.showing()});
  },
  _onChange (e) {
    if (e.target.value) {
      SearchActions.showSearchResults();
      SearchActions.searchTracks(e.target.value);
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
  render () {
    return (
      <div className="nav-bar-center">
        <form>
          <input id="search-input"
                 type="text"
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
