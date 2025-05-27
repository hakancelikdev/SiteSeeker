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
            const historyMap = new Map(historyItems.map(item => [item.url, item]));

            // Process all bookmarks
            for (const bookmark of allBookmarks) {
                const existingHistory = historyMap.get(bookmark.url);
                if (existingHistory) {
                    // Update existing history item
                    existingHistory.title = bookmark.title;
                    existingHistory.isBookmark = true;
                } else {
                    // Add new history item for bookmark
                    historyMap.set(bookmark.url, {
                        title: bookmark.title,
                        url: bookmark.url,
                        score: 1,
                        lastVisitTime: null,
                        isBookmark: true
                    });
                }
            }

            // Save all updated history items
            await this.historyRepository.save([...historyMap.values()]);
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
}

module.exports = BookmarkService;
