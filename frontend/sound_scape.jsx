const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;
const hashHistory = ReactRouter.hashHistory;

const App = require('./components/app');
const Splash = require('./components/splash');
const Collection = require('./components/collection');
const Results = require('./components/results');
const Reports = require('./components/reports');

const SessionActions = require('./actions/session_actions');
const SessionStore = require('./stores/session_store');

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Splash} />
    <Route path="/collection" component={Collection} onEnter={ _ensureLoggedIn } />
    <Route path="/reports" component={Reports} onEnter={ _ensureAdmin } />
    <Route path="/results/:query" component={Results} />
  </Route>
);

function _ensureLoggedIn (nextState, replace) {
  if (!SessionStore.currentUser()) {
    replace('/');
  }
}

function _ensureAdmin (nextState, replace) {
  if (!SessionStore.currentUser() || !SessionStore.currentUser().admin) {
    replace('/');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  SessionActions.receiveCurrentUser(window.currentUser);
  ReactDOM.render(<Router history={hashHistory}>{routes}</Router>,
                  document.getElementById('root'));
});
