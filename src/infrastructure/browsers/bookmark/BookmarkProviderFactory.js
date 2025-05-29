const log = require('electron-log');

const BookmarkProviderRegistry = require('./BookmarkProviderRegistry');

class BookmarkProviderFactory {
    constructor() {
        this.registry = BookmarkProviderRegistry;
    }

    async importAllBookmarks() {
        const uniqueUrls = new Set();
        const allBookmarks = [];
        const providers = this.registry.getAllProviders();

        for (const provider of providers) {
            try {
                const bookmarks = await provider.importBookmarks(uniqueUrls);
                allBookmarks.push(...bookmarks);
                log.info(`Imported ${bookmarks.length} bookmarks from ${provider.constructor.name}`);
            } catch (error) {
                log.error(`Error importing bookmarks from ${provider.constructor.name}:`, error);
            }
        }

        return allBookmarks;
    }

    async importBookmarksFromProvider(providerName) {
        const provider = this.registry.getProvider(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }

        try {
            const bookmarks = await provider.importBookmarks(new Set());
            log.info(`Imported ${bookmarks.length} bookmarks from ${providerName}`);
            return bookmarks;
        } catch (error) {
            log.error(`Error importing bookmarks from ${providerName}:`, error);
            throw error;
        }
    }

    getAvailableProviders() {
        return this.registry.getProviderNames();
    }
}

module.exports = new BookmarkProviderFactory();
