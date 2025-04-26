const { app } = require('electron');
const log = require('electron-log');

const MainWindow = require('../windows/MainWindow');
const ApplicationService = require('../../../application/services/ApplicationService');
const ElectronStore = require('../../../infrastructure/persistence/ElectronStore');
const HistoryRepository = require('../../../domain/repositories/HistoryRepository');
const HistoryService = require('../../../domain/services/HistoryService');
const BookmarkService = require('../../../domain/services/BookmarkService');

class App {
    constructor() {
        this.mainWindow = null;
        this.applicationService = null;
    }

    async start() {
        try {
            await this.initialize();
            this.setupEventListeners();
        } catch (error) {
            log.error('Failed to start application:', error);
            app.quit();
        }
    }

    async initialize() {
        // Wait for app to be ready before creating window
        await app.whenReady();

        log.info('Initializing application...');
        
        // Initialize dependencies
        const store = new ElectronStore();
        const historyRepository = new HistoryRepository(store);
        const historyService = new HistoryService(historyRepository);
        const bookmarkService = new BookmarkService(historyRepository);
        this.applicationService = new ApplicationService(historyService, bookmarkService);

        // Start application services
        await this.applicationService.initialize();
        log.info('Application initialized successfully');
        
        // Create main window
        this.mainWindow = new MainWindow();
        this.mainWindow.create();
    }

    setupEventListeners() {
        app.on('activate', () => {
            if (this.mainWindow) {
                this.mainWindow.show();
            }
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // Global error handler
        process.on('uncaughtException', (error) => {
            log.error('Uncaught Exception:', error);
            app.quit();
        });
    }
}

module.exports = App; 