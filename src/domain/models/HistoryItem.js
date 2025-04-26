const INITIAL_SCORE = 1;

class HistoryItem {
  constructor(title, url, score = INITIAL_SCORE, lastVisitTime = null) {
    this.title = title;
    this.url = url;
    this.score = score;
    this.lastVisitTime = lastVisitTime;
  }
}

module.exports = {
  HistoryItem,
  INITIAL_SCORE
}; 