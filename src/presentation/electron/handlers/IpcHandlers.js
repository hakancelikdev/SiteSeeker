const { ipcMain } = require('electron');
const log = require('electron-log');

class IpcHandlers {
  constructor(historyService, bookmarkService, mainWindow) {
    this.historyService = historyService;
    this.bookmarkService = bookmarkService;
    this.mainWindow = mainWindow;
  }

  setup() {
    // Handle search request
    ipcMain.on('search', async (event, searchTerm) => {
      try {
        log.info('Search request received:', searchTerm);
        const results = await this.historyService.search(searchTerm);
        log.info(`Found ${results.length} results for search term:`, searchTerm);
        this.mainWindow.send('search-results', results);
      } catch (error) {
        log.error('Error handling search:', error);
        this.mainWindow.send('search-results', []);
      }
    });

    // Handle reset history
    ipcMain.on('resetHistory', async (event) => {
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
      require('electron').shell.openExternal(url);
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
    ipcMain.on('importHistory', async (event) => {
      try {
          log.info('Import request received');
          
          // First import history
          log.info('Starting history import...');
          const historyCount = await this.historyService.importFromBrowser();
          event.reply('importHistoryResponse', { success: true, count: historyCount });
          event.reply('history-updated', historyCount);
          
          // Then import bookmarks
          log.info('Starting bookmark import...');
          const bookmarkCount = await this.bookmarkService.importFromBrowser();
          event.reply('bookmark-import-complete', bookmarkCount);
          
          log.info(`Import completed. History: ${historyCount}, Bookmarks: ${bookmarkCount}`);
      } catch (error) {
          log.error('Error during import:', error);
          event.reply('importHistoryResponse', { success: false, error: error.message });
      }
    });

    // Handle get-url-count request
      ipcMain.on('get-url-count', async (event) => {
        try {
            log.info('Get URL count request received');
            const count = await this.historyService.getUrlCount();
            event.reply('history-updated', count);
        } catch (error) {
            log.error('Error getting URL count:', error);
            event.reply('error', error.message);
        }
      });
    }
}

module.exports = IpcHandlers; 