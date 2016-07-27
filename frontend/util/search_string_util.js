module.exports = {
  cleanSpotifyTitle (title) {
   // only take what is before ' - ' and not in parens '(...)'
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
   return cleanedTitle;
 },
 dropStars (title) {
    let str = "";
    for (var i = 0; i < title.length; i++) {
      if (title[i] !== "*" && title[i] !== "#") {
        str += title[i];
      }
    }
    return str;
  },
  wildCardSpacesAndStars (title) {
    let str = "";
    let spaceOrStar = false;
    title = title.replace(new RegExp("^the |^an |^a ", "ig"), "");
    for (var i = 0; i < title.length; i++) {
      if (title[i] === " " || title[i] === "*" || title[i] === "#" || title[i] === "$") {
        if (spaceOrStar) {
          continue;
        } else {
          str += ".*";
          spaceOrStar = true;
        }
      } else {
        str += title[i];
        spaceOrStar = false;
      }
    }
    return str;
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
  }
};
