const StringScorer = function (string) {
  this.string = string;
  // init grid with width zero
  this.grid = [];
  for (let i = 0; i < string.length + 1; i++) {
    this.grid.push([i]);
  }
};

StringScorer.prototype.scoreString = function (string, bestScore) {
  // resize grid if need be
  if (string.length > this.gridWidth()) {
    this.resizeGrid(string.length);
  }

  if (!string.length) {
    return 1 - (this.string.length / Math.max(this.string.length, string.length));
  } else if (!this.string.length) {
    return 1 - (string.length / Math.max(this.string.length, string.length));
  }

  let cost;
  for (let i = 1; i < this.string.length + 1; i++) {
    const char1 = this.string[i - 1];
    for (let j = 1; j < string.length + 1; j++) {
      const char2 = string[j - 1];
      cost = (char1.toLowerCase() === char2.toLowerCase() ? 0 : 1);
      this.grid[i][j] = Math.min(this.grid[i - 1][j] + 1,
                                 this.grid[i][j - 1] + 1,
                                 this.grid[i - 1][j - 1] + cost);
      // check to see if score has already fallen below best score
      if (i === j) {
        const score = 1 - (this.grid[i][j] / Math.max(this.string.length, string.length));
        if (score <= bestScore) { return score; }
      }
    }
  }
  const dist = this.grid[this.string.length][string.length];
  return 1 - (dist / Math.max(this.string.length, string.length));
};

StringScorer.prototype.gridWidth = function () {
  return this.grid[0].length - 1;
};

StringScorer.prototype.resizeGrid = function (newWidth) {
  const colsToAdd = newWidth - this.gridWidth();
  for (let i = 0; i < this.grid.length; i++) {
    for (let j = 0; j < colsToAdd; j++) {
      this.grid[i].push(i === 0 ? this.gridWidth() + j + 1 : null);
    }
  }
};

module.exports = StringScorer;
