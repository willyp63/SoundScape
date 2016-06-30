const ReactDOM = require("react-dom");
const React = require('react');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;
const hashHistory = ReactRouter.hashHistory;

const App = require('./components/app');
const TrackIndex = require('./components/track_index');
const Collection = require('./components/collection');

const SessionActions = require('./actions/session_actions');
const SessionStore = require('./stores/session_store');

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={TrackIndex} />
    <Route path="/collection" component={Collection} onEnter={ _ensureLoggedIn }>
      <Route path="tracks" component={TrackIndex}/>
      <Route path="likes" component={TrackIndex}/>
    </Route>
  </Route>
);

function _ensureLoggedIn (nextState, replace) {
  if (!SessionStore.currentUser()) {
    replace('/');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  SessionActions.receiveCurrentUser(window.currentUser);
  ReactDOM.render(<Router history={hashHistory}>{routes}</Router>,
                  document.getElementById('root'));
});
