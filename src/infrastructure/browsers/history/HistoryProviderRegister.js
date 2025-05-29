const HistoryProviderFactory = require('./HistoryProviderFactory');

class HistoryProviderRegister {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    const supportedBrowsers = HistoryProviderFactory.getSupportedBrowsers();
    for (const browser of supportedBrowsers) {
      try {
        const provider = HistoryProviderFactory.createProvider(browser);
        this.providers.set(browser, provider);
      } catch (error) {
        console.error(`Failed to initialize ${browser} history provider:`, error);
      }
    }
  }

  getProvider(browserType) {
    const provider = this.providers.get(browserType.toLowerCase());
    if (!provider) {
      throw new Error(`No history provider found for browser: ${browserType}`);
    }
    return provider;
  }

  getAllProviders() {
    return Array.from(this.providers.values());
  }

  getAvailableBrowsers() {
    return Array.from(this.providers.keys());
  }
}

module.exports = HistoryProviderRegister;
