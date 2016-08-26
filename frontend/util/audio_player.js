let _onUpdate, _onLoad, _onEnd;
let _loaded, _updating;

module.exports = {
  audio () {
    return document.getElementById('audio-player');
  },
  init (onLoad, onUpdate, onEnd) {
    if (_onUpdate && _onLoad && _onEnd) { this.removeListeners(); }
    _onUpdate = onUpdate; _onLoad = onLoad; _onEnd = onEnd;
    _loaded = false;

    const audio = this.audio();
    audio.addEventListener("canplay", this.canplay, false);
    audio.addEventListener("ended", _onEnd, false);
    audio.addEventListener("timeupdate", _onUpdate, false);

    // fix for safari
    audio.addEventListener("seeking", function (err) { audio.pause(); }, false);
    audio.addEventListener("seeked", function (err) { audio.play(); }, false);

    audio.load();
    _updating = true;
    $(window).on("resize", this.timeUpdate.bind(this));
  },
  canplay () {
    // only fire _onLoad once
    if (!_loaded) {
      _onLoad();
      _loaded = true;
    }
  },
  removeListeners () {
    const audio = this.audio();
    if (!audio) { return; }
    audio.removeEventListener("canplay", this.canplay);
    audio.removeEventListener("ended", _onEnd);
    audio.removeEventListener("timeupdate", _onUpdate);
    $(window).off("resize", this.timeUpdate.bind(this));
  },
  duration () {
    return this.audio().duration;
  },
  currentTime () {
    return this.audio().currentTime;
  },
  play () {
    this.audio().play();
  },
  pause () {
    this.audio().pause();
  },
  stepBack () {
    this.audio().currentTime = 0;
  },
  timeUpdate () {
    if (!_updating) { return; }
    const audio = this.audio();
    if (!audio) { return; }
    var percent = (audio.currentTime / audio.duration);
    this.moveProgressHead(percent);
  },
  moveProgressHead (percent) {
    const fullWidth = $(".progress-bar-bg").width();
    const left = (percent * fullWidth) - 8;
    $(".progress-bar-head").css('left', `${left}px`);
    $(".progress-bar-fg").width(`${100 * percent}%`);
  },
  setCurrentTime (percent) {
    const audio = this.audio();
    audio.currentTime = audio.duration * percent;
  },
  setVolume (percent) {
    const audio = this.audio();
    if (!audio) { return; }
    audio.volume = percent;
  },
  stopUpdating () {
    _updating = false;
  },
  resumeUpdating () {
    _updating = true;
  }
};
