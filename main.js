const { app, ipcMain } = require('electron');
const log = require('electron-log');
const ElectronStore = require('./src/infrastructure/persistence/ElectronStore');
const HistoryRepository = require('./src/domain/repositories/HistoryRepository');
const HistoryService = require('./src/domain/services/HistoryService');
const ApplicationService = require('./src/application/services/ApplicationService');
const MainWindow = require('./src/presentation/electron/windows/MainWindow');
const { shell } = require('electron');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'info';

// Global error handler
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    app.quit();
});

let applicationService;
let mainWindow;

// Initialize application
async function initializeApplication() {
    try {
        log.info('Initializing application...');
        
        // Initialize dependencies
        const store = new ElectronStore();
        const historyRepository = new HistoryRepository(store);
        const historyService = new HistoryService(historyRepository);
        applicationService = new ApplicationService(historyService);

        // Start application
        await applicationService.initialize();
        log.info('Application initialized successfully');

        return applicationService;
    } catch (error) {
        log.error('Failed to initialize application:', error);
        throw error;
    }
}

// Handle import history request
ipcMain.on('importHistory', async (event) => {
    try {
        log.info('Import history request received');
        const count = await applicationService.historyService.importFromBrowser();
        event.reply('importHistoryResponse', { success: true, count });
        event.reply('history-updated', count);
    } catch (error) {
        log.error('Error importing history:', error);
        event.reply('importHistoryResponse', { success: false, error: error.message });
    }
});

// Handle reset history request
ipcMain.on('resetHistory', async (event) => {
    try {
        log.info('Reset history request received');
        await applicationService.historyService.resetHistory();
        event.reply('resetHistoryResponse', { success: true });
        event.reply('history-updated', 0);
    } catch (error) {
        log.error('Error resetting history:', error);
        event.reply('resetHistoryResponse', { success: false, error: error.message });
    }
});

// Handle search request
ipcMain.on('search', async (event, searchTerm) => {
    try {
        log.info('Search request received:', searchTerm);
        
        if (!applicationService) {
            log.error('Application service not initialized');
            event.reply('error', 'Application not initialized');
            return;
        }

        if (!applicationService.historyService) {
            log.error('History service not available');
            event.reply('error', 'History service not available');
            return;
        }

        log.info('Executing search with term:', searchTerm);
        const results = await applicationService.historyService.search(searchTerm);
        log.info(`Found ${results.length} results for search term:`, searchTerm);
        log.debug('Search results:', results);
        
        event.reply('search-results', results);
    } catch (error) {
        log.error('Error searching history:', error);
        event.reply('error', error.message);
    }
});

// Handle get-url-count request
ipcMain.on('get-url-count', async (event) => {
    try {
        log.info('Get URL count request received');
        const count = await applicationService.historyService.getUrlCount();
        event.reply('history-updated', count);
    } catch (error) {
        log.error('Error getting URL count:', error);
        event.reply('error', error.message);
    }
});

// Handle open-url request
ipcMain.on('open-url', async (event, url) => {
    try {
        log.info('Open URL request received:', url);
        await shell.openExternal(url);
    } catch (error) {
        log.error('Error opening URL:', error);
        event.reply('error', error.message);
    }
});

// Main application entry point
app.whenReady().then(async () => {
    try {
        await initializeApplication();
        
        mainWindow = new MainWindow();
        mainWindow.create();
        
        app.on('activate', () => {
            mainWindow.show();
        });
    } catch (error) {
        log.error('Critical error during startup:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}); 