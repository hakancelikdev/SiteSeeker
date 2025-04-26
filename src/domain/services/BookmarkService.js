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
            
            // Update history items with bookmark names
            await this.updateHistoryWithBookmarks(allBookmarks);
            
            log.info(`Successfully imported ${allBookmarks.length} bookmarks`);
            return allBookmarks.length;
        } catch (error) {
            log.error('Error importing browser bookmarks:', error);
            throw error;
        }
    }

    async updateHistoryWithBookmarks(bookmarks) {
        try {
            const historyItems = await this.historyRepository.getAll();
            const historyMap = new Map(historyItems.map(item => [item.url, item]));
            let updatedCount = 0;
            
            for (const bookmark of bookmarks) {
                const existingHistory = historyMap.get(bookmark.url);
                if (existingHistory && !existingHistory.isBookmark) {
                    // Update the history item with bookmark name
                    existingHistory.title = bookmark.title;
                    existingHistory.isBookmark = true;
                    updatedCount++;
                }
            }
            
            if (updatedCount > 0) {
                // Save the updated history
                await this.historyRepository.save([...historyMap.values()]);
                log.info(`Updated ${updatedCount} history items with bookmark information`);
            }
        } catch (error) {
            log.error('Error updating history with bookmarks:', error);
            throw error;
        }
    }

    async importRecentBookmarks(fromTime) {
        try {
            if (!fromTime || typeof fromTime !== 'number') {
                throw new Error('Invalid fromTime parameter');
            }

            log.info(`Importing recent bookmarks from ${new Date(fromTime).toISOString()}`);
            return await this.importFromBrowser();
        } catch (error) {
            log.error('Error importing recent bookmarks:', error);
            throw error;
        }
    }
}

module.exports = BookmarkService; 