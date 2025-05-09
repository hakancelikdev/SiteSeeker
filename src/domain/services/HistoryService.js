const log = require('electron-log');

const ChromeHistoryProvider = require('../../infrastructure/browsers/ChromeHistoryProvider');
const FirefoxHistoryProvider = require('../../infrastructure/browsers/FirefoxHistoryProvider');
const BrowserPermissions = require('../../infrastructure/permissions/BrowserPermissions');

class HistoryServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'HistoryServiceError';
        this.code = code;
    }
}

class HistoryService {
    constructor(historyRepository) {
        this.historyRepository = historyRepository;
        this.uniqueUrls = new Set();
        this.browserProviders = [
            new ChromeHistoryProvider(),
            new FirefoxHistoryProvider()
        ];
    }

    async checkBrowserPermissions() {
        try {
            const [chromePermission, firefoxPermission] = await Promise.all([
                BrowserPermissions.checkChromePermissions(),
                BrowserPermissions.checkFirefoxPermissions()
            ]);

            if (!chromePermission && !firefoxPermission) {
                throw new HistoryServiceError(
                    'No browser permissions available. Please grant access to browser history files.',
                    'NO_BROWSER_PERMISSIONS'
                );
            }

            return {
                chrome: chromePermission,
                firefox: firefoxPermission
            };
        } catch (error) {
            log.error('Error checking browser permissions:', error);
            throw new HistoryServiceError(
                'Failed to check browser permissions',
                'PERMISSION_CHECK_FAILED',
                error
            );
        }
    }

    async getUrlCount() {
        try {
            log.info('Getting URL count...');
            const history = await this.historyRepository.getAll();
            const count = history.length;
            log.info(`Found ${count} URLs in history`);
            return count;
        } catch (error) {
            log.error('Error getting URL count:', error);
            throw new HistoryServiceError(
                'Failed to get URL count',
                'GET_COUNT_FAILED',
                error
            );
        }
    }

    async search(searchTerm) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                log.error('Invalid search term:', searchTerm);
                throw new HistoryServiceError(
                    'Invalid search term provided',
                    'INVALID_SEARCH_TERM'
                );
            }

            log.info(`Searching history for term: "${searchTerm}"`);

            const history = await this.historyRepository.getAll();
            log.info(`Retrieved ${history.length} total history items`);

            // Check if searching only bookmarks
            const isBookmarkSearch = searchTerm.startsWith('b:');
            const searchTermLower = isBookmarkSearch
                ? searchTerm.slice(2).toLowerCase().trim()
                : searchTerm.toLowerCase();

            log.info('Normalized search term:', searchTermLower);

            // Split search term into words for partial matching
            const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0);

            const filteredResults = history.filter(item => {
                if (!item.title || !item.url) {
                    log.debug('Skipping invalid history item:', item);
                    return false;
                }

                // Filter by bookmark status if needed
                if (isBookmarkSearch && !item.isBookmark) {
                    return false;
                }

                const titleLower = item.title.toLowerCase();
                const urlLower = item.url.toLowerCase();

                // Check if all search words are found in either title or URL
                return searchWords.every(word =>
                    titleLower.includes(word) || urlLower.includes(word)
                );
            });

            log.info(`Found ${filteredResults.length} matching items before sorting`);

            // Sort by score and last visit time
            const sortedResults = filteredResults.sort((a, b) => {
                // Primary sort by score
                const scoreDiff = b.score - a.score;
                if (scoreDiff !== 0) return scoreDiff;

                // Secondary sort by last visit time
                return b.lastVisitTime - a.lastVisitTime;
            });

            const finalResults = sortedResults.slice(0, 50);

            log.info(`Returning ${finalResults.length} results`);

            return finalResults;
        } catch (error) {
            log.error('Error during search:', error);
            throw new HistoryServiceError(
                'Search operation failed',
                'SEARCH_FAILED',
                error
            );
        }
    }

    async importFromBrowser() {
        try {
            log.info('Starting browser history import...');

            // Check permissions first
            const permissions = await this.checkBrowserPermissions();
            log.info('Browser permissions:', permissions);

            let allHistory = [];
            this.uniqueUrls.clear();

            // Import from all browser providers in parallel
            const importPromises = this.browserProviders.map(provider =>
                provider.importHistory(this.uniqueUrls)
            );

            const results = await Promise.all(importPromises);
            allHistory = results.flat();

            // Save imported history
            await this.saveHistory(allHistory);

            log.info(`Successfully imported ${allHistory.length} history items`);
            return allHistory.length;
        } catch (error) {
            log.error('Error importing browser histories:', error);
            throw new HistoryServiceError(
                'Failed to import browser history',
                'IMPORT_FAILED',
                error
            );
        }
    }

    async importRecentHistory(fromTime) {
        try {
            if (!fromTime || typeof fromTime !== 'number') {
                throw new HistoryServiceError('Invalid fromTime parameter', 'INVALID_TIMESTAMP');
            }

            log.info(`Importing recent history from ${new Date(fromTime).toISOString()}`);
            let allHistory = await this.historyRepository.getAll();

            // Import recent history from all providers in parallel
            const importPromises = this.browserProviders.map(provider =>
                provider.importHistory(this.uniqueUrls, fromTime)
            );

            const results = await Promise.all(importPromises);
            const recentHistory = results.flat();

            // Update or add new items using Map for better performance
            const historyMap = new Map(allHistory.map(item => [item.url, item]));

            for (const item of recentHistory) {
                const existing = historyMap.get(item.url);
                if (existing) {
                    historyMap.set(item.url, {
                        ...existing,
                        ...item,
                        score: Math.max(existing.score, item.score)
                    });
                } else {
                    historyMap.set(item.url, item);
                }
            }

            allHistory = Array.from(historyMap.values());

            // Save updated history
            await this.saveHistory(allHistory);

            log.info(`Successfully updated history with ${recentHistory.length} new items`);
            return allHistory.length;
        } catch (error) {
            log.error('Error importing recent history:', error);
            throw new HistoryServiceError(
                'Failed to import recent history',
                'RECENT_IMPORT_FAILED',
                error
            );
        }
    }

    async saveHistory(history) {
        try {
            return await this.historyRepository.save(history);
        } catch (error) {
            log.error('Error saving history:', error);
            throw new HistoryServiceError(
                'Failed to save history',
                'SAVE_FAILED',
                error
            );
        }
    }

    async resetHistory() {
        try {
            log.info('Resetting history...');
            await this.historyRepository.save([]);
            this.uniqueUrls.clear();
            log.info('History reset successfully');
        } catch (error) {
            log.error('Error resetting history:', error);
            throw new HistoryServiceError(
                'Failed to reset history',
                'RESET_FAILED',
                error
            );
        }
    }
}

module.exports = HistoryService;
