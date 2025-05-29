const log = require('electron-log');

const ChromeBookmarkProvider = require('./providers/ChromeBookmarkProvider');
const FirefoxBookmarkProvider = require('./providers/FirefoxBookmarkProvider');

class BookmarkProviderRegistry {
    constructor() {
        this.providers = new Map();
        this.initializeProviders();
    }

    initializeProviders() {
        // Register default providers
        this.registerProvider('chrome', new ChromeBookmarkProvider());
        this.registerProvider('firefox', new FirefoxBookmarkProvider());
    }

    registerProvider(name, provider) {
        if (this.providers.has(name)) {
            log.warn(`Provider ${name} is already registered. Overwriting...`);
        }
        this.providers.set(name, provider);
        log.info(`Registered bookmark provider: ${name}`);
    }

    getProvider(name) {
        const provider = this.providers.get(name);
        if (!provider) {
            log.warn(`Provider ${name} not found`);
            return null;
        }
        return provider;
    }

    getAllProviders() {
        return Array.from(this.providers.values());
    }

    getProviderNames() {
        return Array.from(this.providers.keys());
    }
}

// Export a singleton instance
module.exports = new BookmarkProviderRegistry();
