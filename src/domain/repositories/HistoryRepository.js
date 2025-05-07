const log = require('electron-log');

class HistoryRepositoryError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'HistoryRepositoryError';
        this.code = code;
    }
}

class HistoryRepository {
    constructor(store) {
        this.store = store;
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    async ensureStoreInitialized() {
        let retries = 0;
        while (!this.store && retries < this.maxRetries) {
            log.warn(`Store not initialized, retry attempt ${retries + 1}/${this.maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            retries++;
        }

        if (!this.store) {
            throw new HistoryRepositoryError(
                'Store could not be initialized after maximum retries',
                'STORE_INIT_FAILED'
            );
        }
    }

    async getAll() {
        try {
            log.info('Getting all history items...');
            await this.ensureStoreInitialized();

            const history = this.store.get('savedHistory', []);
            log.info(`Retrieved ${history.length} history items from store`);

            // Validate history items
            const validHistory = history.filter(item => {
                const isValid = item && typeof item === 'object' && item.url && item.title;
                if (!isValid) {
                    log.warn('Found invalid history item:', item);
                }
                return isValid;
            });

            if (validHistory.length !== history.length) {
                log.warn(`Filtered out ${history.length - validHistory.length} invalid history items`);
            }

            return validHistory;
        } catch (error) {
            log.error('Error retrieving history:', error);
            throw new HistoryRepositoryError(
                'Failed to retrieve history',
                'GET_ALL_FAILED',
                error
            );
        }
    }

    async getCount() {
        try {
            await this.ensureStoreInitialized();
            const count = this.store.get('historyCount', 0);
            log.debug(`Retrieved history count: ${count}`);
            return count;
        } catch (error) {
            log.error('Error retrieving history count:', error);
            throw new HistoryRepositoryError(
                'Failed to retrieve history count',
                'GET_COUNT_FAILED',
                error
            );
        }
    }

    async save(history) {
        try {
            await this.ensureStoreInitialized();

            if (!Array.isArray(history)) {
                throw new HistoryRepositoryError(
                    'History must be an array',
                    'INVALID_HISTORY_FORMAT'
                );
            }

            this.store.set('savedHistory', history);
            this.store.set('historyCount', history.length);

            log.info(`Saved ${history.length} history items`);
            return history.length;
        } catch (error) {
            log.error('Error saving history:', error);
            throw new HistoryRepositoryError(
                'Failed to save history',
                'SAVE_FAILED',
                error
            );
        }
    }
}

module.exports = HistoryRepository;
