const ElectronStore = require('../ElectronStore');

class WindowPositionRepository {
    constructor() {
        this.store = new ElectronStore();
    }

    async savePosition(x, y) {
        try {
            this.store.set('windowPosition', { x, y });
        } catch (error) {
            console.error('Error saving window position:', error);
            throw error;
        }
    }

    async getLatestPosition() {
        try {
            return this.store.get('windowPosition', null);
        } catch (error) {
            console.error('Error getting window position:', error);
            return null;
        }
    }

    async close() {
        // ElectronStore doesn't need explicit closing
        // This method is kept for compatibility
    }
}

module.exports = WindowPositionRepository;
