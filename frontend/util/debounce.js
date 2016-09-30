function debounce (fn, waitTime) {
  let waiting = false;
  let mostRecentArgs;
  const makeCall = function (arguements) {
    fn(...arguements);
    waiting = true;
    mostRecentArgs = null;

    setTimeout(function () {
      if (mostRecentArgs) {
        makeCall(mostRecentArgs);
      } else {
        waiting = false;
      }
    }, waitTime);
  };

  return function (...args) {
    if (waiting) {
      mostRecentArgs = args.slice();
    } else {
      makeCall(args);
    }
  };
}

module.exports = debounce;
