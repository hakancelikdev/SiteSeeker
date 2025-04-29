const Store = require('electron-store');
const log = require('electron-log');

class ElectronStoreError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'ElectronStoreError';
        this.code = code;
    }
}

class ElectronStore {
    constructor() {
        this.initializeStore();
    }

    initializeStore() {
        try {
            this.store = new Store({
                name: 'siteseeker-store',
                clearInvalidConfig: true,
                encryptionKey: 'siteseeker-secure-key',
                fileExtension: 'json',
                watch: true
            });
            log.info('Electron store initialized successfully');
        } catch (error) {
            log.error('Failed to initialize electron-store:', error);
            throw new ElectronStoreError(
                'Failed to initialize store',
                'INIT_FAILED',
                error
            );
        }
    }

    get(key, defaultValue) {
        if (!this.store) {
            throw new ElectronStoreError(
                'Store not initialized',
                'STORE_NOT_INITIALIZED'
            );
        }

        if (typeof key !== 'string') {
            throw new ElectronStoreError(
                'Key must be a string',
                'INVALID_KEY_TYPE'
            );
        }

        try {
            const value = this.store.get(key, defaultValue);
            log.debug(`Retrieved value for key: ${key}`);
            return value;
        } catch (error) {
            log.error(`Error getting value for key ${key}:`, error);
            throw new ElectronStoreError(
                `Failed to get value for key ${key}`,
                'GET_FAILED',
                error
            );
        }
    }

    set(key, value) {
        if (!this.store) {
            throw new ElectronStoreError(
                'Store not initialized',
                'STORE_NOT_INITIALIZED'
            );
        }

        if (typeof key !== 'string') {
            throw new ElectronStoreError(
                'Key must be a string',
                'INVALID_KEY_TYPE'
            );
        }

        try {
            this.store.set(key, value);
            log.debug(`Set value for key: ${key}`);
        } catch (error) {
            log.error(`Error setting value for key ${key}:`, error);
            throw new ElectronStoreError(
                `Failed to set value for key ${key}`,
                'SET_FAILED',
                error
            );
        }
    }

    clear() {
        if (!this.store) {
            throw new ElectronStoreError(
                'Store not initialized',
                'STORE_NOT_INITIALIZED'
            );
        }

        try {
            this.store.clear();
            log.info('Store cleared successfully');
        } catch (error) {
            log.error('Error clearing store:', error);
            throw new ElectronStoreError(
                'Failed to clear store',
                'CLEAR_FAILED',
                error
            );
        }
    }
}

module.exports = ElectronStore;
