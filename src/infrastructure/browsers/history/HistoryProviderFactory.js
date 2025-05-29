const ChromeHistoryProvider = require('./providers/ChromeHistoryProvider');
const FirefoxHistoryProvider = require('./providers/FirefoxHistoryProvider');

class HistoryProviderFactory {
  static createProvider(browserType) {
    switch (browserType.toLowerCase()) {
      case 'chrome':
        return new ChromeHistoryProvider();
      case 'firefox':
        return new FirefoxHistoryProvider();
      default:
        throw new Error(`Unsupported browser type: ${browserType}`);
    }
  }

  static getSupportedBrowsers() {
    return ['chrome', 'firefox'];
  }
}

module.exports = HistoryProviderFactory;
