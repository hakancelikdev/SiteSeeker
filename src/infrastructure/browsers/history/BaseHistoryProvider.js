const log = require('electron-log');

const { HistoryItem, INITIAL_SCORE } = require('../../../domain/models/HistoryItem');

class BaseHistoryProvider {
  constructor() {
    if (this.constructor === BaseHistoryProvider) {
      throw new Error('BaseHistoryProvider is an abstract class and cannot be instantiated directly');
    }
  }

  async getProfiles() {
    throw new Error('getProfiles() must be implemented by subclass');
  }

  async importHistory(uniqueUrls = new Set(), fromTime = 0) {
    throw new Error('importHistory() must be implemented by subclass');
  }

  createHistoryItem(title, url, score = INITIAL_SCORE, lastVisitTime = null) {
    return new HistoryItem(title.trim(), url, score, lastVisitTime);
  }

  logError(message, error) {
    log.error(message, error);
  }

  logInfo(message) {
    log.info(message);
  }

  logWarn(message) {
    log.warn(message);
  }

  async getHistory() {
    throw new Error('getHistory method must be implemented by subclasses');
  }

  async getHistoryByTimeRange(fromTime, toTime) {
    const history = await this.getHistory();
    return history.filter(item => item.lastVisitTime >= fromTime && item.lastVisitTime <= toTime);
  }
}

module.exports = { BaseHistoryProvider };
