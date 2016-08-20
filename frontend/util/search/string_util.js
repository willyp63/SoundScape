module.exports = {
  cleanSpotifyTitle (title) {
    // only take what is before ' -|: ' and not in parens '(.*)'
    let cleanedTitle = "";
    let betweenParens = false;
    let dashPoint = title.indexOf("-") + 1 || title.length + 1;
    let semipoint = title.indexOf(":") + 1 || title.length + 1;
    let endPoint = Math.min(dashPoint, semipoint) - 1;
    for (let i = 0; i < endPoint; i++) {
     if (betweenParens) {
       continue;
     } else if (title[i] === "(") {
       betweenParens = true;
     } else if (title[i] === ")" && betweenParens) {
       betweenParens = false;
     } else {
       cleanedTitle += title[i];
     }
    }
    return cleanedTitle.trim();
  },
  extractDuration (str) {
    const minutesMatch = str.match(new RegExp('PT(.*)M.*'));
    if (!minutesMatch) {
      const secondsMatch = str.match(new RegExp('PT(.*)S'));
      return parseInt(secondsMatch[1]);
    } else {
      const minutes = parseInt(minutesMatch[1]);
      const secondsMatch = str.match(new RegExp('PT.*M(.*)S'));
      const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
      return (minutes * 60) + seconds;
    }
  },
  formatQuery (track) {
    return `${track.artists[0]} ${this.cleanSpotifyTitle(track.title)}`;
  },
  countNumSpaces (string) {
    let count = 0;
    for (let i = 0; i < string.length; i++) {
      if (string[i] === ' ') {
        count++;
      }
    }
    return count;
  },
  numWords (string) {
    return this.countNumSpaces(string) + 1;
  },
  spaceIndecies (string) {
    let indecies = [0];
    for (let i = 0; i < string.length - 1; i++) {
      if (string[i] === ' ') {
        indecies.push(i + 1);
      }
    }
    indecies.push(string.length + 1);
    return indecies;
  },
  dropPeriods (string) {
    return string.replace(new RegExp('\\.', 'g'), '');
  },
  removeSeperatorsAndExtraSpaces (string) {
    string = string.trim();
    let atSpace = false;
    let returnString = '';
    for (let i = 0; i < string.length; i++) {
      if (['(', ')', '[', ']', '-', '"'].includes(string[i])) {
        if (i !== 0 && i !== string.length - 1) {
          if (!atSpace) {
            returnString += ' ';
          }
          atSpace = true;
        } else {
          atSpace = false;
        }
      } else if (string[i] === ' ') {
        if (!atSpace) {
          returnString += string[i];
        }
        atSpace = true;
      } else {
        returnString += string[i];
        atSpace = false;
      }
    }
    return returnString;
  }
};
