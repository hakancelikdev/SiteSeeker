const INITIAL_SCORE = 1;

class HistoryItem {
  constructor(title, url, score = INITIAL_SCORE) {
    this.title = title;
    this.url = url;
    this.score = score;
  }
}

module.exports = {
  HistoryItem,
  INITIAL_SCORE
}; 