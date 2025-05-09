const { ipcMain } = require('electron');
const log = require('electron-log');
const { shell } = require('electron');

const GoogleAnalyticsService = require('../../../infrastructure/analytics/GoogleAnalyticsService.js');

class IpcHandlers {
  constructor(historyService, bookmarkService, mainWindow) {
    this.historyService = historyService;
    this.bookmarkService = bookmarkService;
    this.mainWindow = mainWindow;
    this.analytics = new GoogleAnalyticsService();
  }

  setup() {
    // Handle search request
    ipcMain.on('search', async (_, searchTerm) => {
      try {
        log.info('Search request received:', searchTerm);
        const results = await this.historyService.search(searchTerm);
        this.mainWindow.send('search-results', results);
      } catch (error) {
        log.error('Search error:', error);
        this.mainWindow.send('error', error.message);
      }
    });

    // Handle reset history
    ipcMain.on('resetHistory', async (_) => {
      try {
        await this.historyService.resetHistory();
        this.mainWindow.send('resetHistoryResponse', { success: true });
      } catch (error) {
        log.error('Error resetting history:', error);
        this.mainWindow.send('resetHistoryResponse', { success: false, error: error.message });
      }
    });

    // Handle URL opening
    ipcMain.on('open-url', (event, url) => {
      shell.openExternal(url);
    });

    // Handle search history (legacy support)
    ipcMain.on('search-history', async (event, searchTerm) => {
      try {
        log.info('Legacy search request received:', searchTerm);
        const results = await this.historyService.search(searchTerm);
        log.info(`Found ${results.length} results for search term:`, searchTerm);
        this.mainWindow.send('search-results', results);
      } catch (error) {
        log.error('Error searching history:', error);
        this.mainWindow.send('search-results', []);
      }
    });

    // Handle import request
    ipcMain.on('importHistory', async (_) => {
      try {
        log.info('Import request received');

        // First import history
        log.info('Starting history import...');
        const historyCount = await this.historyService.importFromBrowser();
        this.mainWindow.send('importHistoryResponse', { success: true, count: historyCount });
        this.mainWindow.send('history-updated', historyCount);

        // Then import bookmarks
        log.info('Starting bookmark import...');
        const bookmarkCount = await this.bookmarkService.importFromBrowser();
        this.mainWindow.send('bookmark-import-complete', bookmarkCount);

        log.info(`Import completed. History: ${historyCount}, Bookmarks: ${bookmarkCount}`);
      } catch (error) {
        log.error('Error during import:', error);
        this.mainWindow.send('importHistoryResponse', { success: false, error: error.message });
      }
    });

    // Handle get-url-count request
    ipcMain.on('get-url-count', async (_) => {
      try {
        log.info('Get URL count request received');
        const count = await this.historyService.getUrlCount();
        this.mainWindow.send('history-updated', count);
      } catch (error) {
        log.error('Error getting URL count:', error);
        this.mainWindow.send('error', error.message);
      }
    });

    // Handle hide-window request
    ipcMain.on('hide-window', () => {
      this.mainWindow.hide();
    });

    ipcMain.on('analytics-import-clicked', () => {
      this.analytics.trackImportClicked();
    });
    ipcMain.on('analytics-reset-clicked', () => {
      this.analytics.trackResetClicked();
    });
    ipcMain.on('analytics-search-performed', (_, searchTerm) => {
      this.analytics.trackSearchPerformed(searchTerm);
    });
    ipcMain.on('analytics-search-result-clicked', (_, data) => {
      this.analytics.trackSearchResultClicked(data.url, data.searchTerm);
      if (data.command) {
        this.analytics.trackCommandLinkOpened(data.url);
      }
    });
    ipcMain.on('analytics-command-link-opened', (_, url) => {
      this.analytics.trackCommandLinkOpened(url);
    });
  }
}

module.exports = IpcHandlers;
