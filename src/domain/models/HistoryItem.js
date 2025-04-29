const INITIAL_SCORE = 0;

class HistoryItem {
  constructor(title, url, score = INITIAL_SCORE, lastVisitTime = null) {
    this.title = title;
    this.url = url;
    this.score = score;
    this.lastVisitTime = lastVisitTime;
    this.isBookmark = false; // Flag to identify if this is a bookmark
  }
}

module.exports = {
  HistoryItem,
  INITIAL_SCORE
};
