const ReactDOM = require("react-dom");
const React = require('react');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;
const hashHistory = ReactRouter.hashHistory;

const App = require('./components/app');
const Home = require('./components/home');
const Collection = require('./components/collection');
const SearchResults = require('./components/search_results');

const SessionActions = require('./actions/session_actions');
const SessionStore = require('./stores/session_store');

const routes = (
  <Route path="/" component={App}>
    <IndexRoute onEnter={_redirectToHome} />
    <Route path="/home" component={Home} />
    <Route path="/collection" component={Collection} onEnter={ _ensureLoggedIn } />
    <Route path="/search/:query" component={SearchResults} />
  </Route>
);

function _redirectToHome (nextState, replace) {
  replace('/home');
}

function _ensureLoggedIn (nextState, replace) {
  if (!SessionStore.currentUser()) {
    replace('/home');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  SessionActions.receiveCurrentUser(window.currentUser);
  ReactDOM.render(<Router history={hashHistory}>{routes}</Router>,
                  document.getElementById('root'));
});
