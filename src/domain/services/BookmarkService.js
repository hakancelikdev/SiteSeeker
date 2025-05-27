const log = require('electron-log');

const ChromeBookmarkProvider = require('../../infrastructure/browsers/ChromeBookmarkProvider');
const FirefoxBookmarkProvider = require('../../infrastructure/browsers/FirefoxBookmarkProvider');

class BookmarkService {
    constructor(historyRepository) {
        this.historyRepository = historyRepository;
        this.bookmarkProviders = [
            new ChromeBookmarkProvider(),
            new FirefoxBookmarkProvider()
        ];
        this.uniqueUrls = new Set();
    }

    async importFromBrowser() {
        try {
            log.info('Starting browser bookmark import...');

            let allBookmarks = [];
            this.uniqueUrls.clear();

            // Import from all browser providers in parallel
            const importPromises = this.bookmarkProviders.map(provider =>
                provider.importBookmarks(this.uniqueUrls)
            );

            const results = await Promise.all(importPromises);
            allBookmarks = results.flat();

            // Get existing history items
            const historyItems = await this.historyRepository.getAll();
            log.info(`Retrieved ${historyItems.length} history items for bookmark merge`);

            // Create a map of existing history items
            const historyMap = new Map(historyItems.map(item => [item.url, item]));

            // Process all bookmarks
            for (const bookmark of allBookmarks) {
                const existingHistory = historyMap.get(bookmark.url);
                if (existingHistory) {
                    // Update existing history item with bookmark info while preserving all properties
                    historyMap.set(bookmark.url, {
                        ...existingHistory,
                        title: bookmark.title || existingHistory.title,
                        isBookmark: true,
                        score: Math.max(existingHistory.score, bookmark.score || 1)
                    });
                } else {
                    // Add new history item for bookmark
                    historyMap.set(bookmark.url, {
                        title: bookmark.title,
                        url: bookmark.url,
                        score: bookmark.score || 1,
                        lastVisitTime: bookmark.lastVisitTime || null,
                        isBookmark: true
                    });
                }
            }

            // Convert map back to array and save
            const updatedHistory = Array.from(historyMap.values());
            log.info(`Saving ${updatedHistory.length} items after bookmark merge`);
            await this.historyRepository.save(updatedHistory);

            log.info(`Successfully imported ${allBookmarks.length} bookmarks`);
            return allBookmarks.length;
        } catch (error) {
            log.error('Error importing browser bookmarks:', error);
            throw error;
        }
    }

    async importRecentBookmarks() {
        try {
            log.info('Importing all bookmarks...');
            return await this.importFromBrowser();
        } catch (error) {
            log.error('Error importing bookmarks:', error);
            throw error;
        }
    }

    async getBookmarkCount() {
        try {
            log.info('Getting bookmark count...');
            const historyItems = await this.historyRepository.getAll();
            const bookmarkCount = historyItems.filter(item => item.isBookmark).length;
            log.info(`Found ${bookmarkCount} bookmarks`);
            return bookmarkCount;
        } catch (error) {
            log.error('Error getting bookmark count:', error);
            throw error;
        }
    }

    async cleanup() {
        log.info('Cleaning up bookmark service...');
        try {
            // Tüm kaynakları temizle
            this.uniqueUrls.clear();

            // Repository'yi temizle
            if (this.historyRepository) {
                await this.historyRepository.cleanup();
            }

            log.info('Bookmark service cleaned up successfully');
        } catch (error) {
            log.error('Error cleaning up bookmark service:', error);
        }
    }
}

module.exports = BookmarkService;
