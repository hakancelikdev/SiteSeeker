const { ipcMain } = require('electron');
const log = require('electron-log');
const { shell } = require('electron');

class IpcHandlers {
  constructor(historyService, bookmarkService, applicationService, mainWindow) {
    this.historyService = historyService;
    this.bookmarkService = bookmarkService;
    this.applicationService = applicationService;
    this.mainWindow = mainWindow;
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
        const { historyCount, bookmarkCount } = await this.applicationService.importBrowserData();
        this.mainWindow.send('importHistoryResponse', { success: true, count: historyCount });
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

        log.info('Getting history count...');
        const historyCount = await this.historyService.getUrlCount();
        log.info(`History count retrieved: ${historyCount}`);

        log.info('Getting bookmark count...');
        const bookmarkCount = await this.bookmarkService.getBookmarkCount();
        log.info(`Bookmark count retrieved: ${bookmarkCount}`);

        log.info(`Sending counts to renderer - History: ${historyCount}, Bookmarks: ${bookmarkCount}`);
        this.mainWindow.send('history-updated', historyCount);
        this.mainWindow.send('bookmarks-updated', bookmarkCount);

        log.info('Counts sent to renderer successfully');
      } catch (error) {
        log.error('Error getting URL count:', error);
        log.error('Error stack:', error.stack);
        this.mainWindow.send('error', error.message);
      }
    });

    // Handle hide-window request
    ipcMain.on('hide-window', () => {
      this.mainWindow.hide();
    });
  }

  cleanup() {
    try {
      // Clear all IPC event listeners
      ipcMain.removeAllListeners();
      log.info('IPC handlers cleaned up successfully');
    } catch (error) {
      log.error('Error during IPC handlers cleanup:', error);
      throw error;
    }
  }
}

module.exports = IpcHandlers;
