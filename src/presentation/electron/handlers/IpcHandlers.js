const { ipcMain } = require('electron');
const log = require('electron-log');

class IpcHandlers {
  constructor(historyService, mainWindow) {
    this.historyService = historyService;
    this.mainWindow = mainWindow;
  }

  setup() {
    // Handle search request
    ipcMain.handle('search', async (event, searchTerm) => {
      try {
        return await this.historyService.search(searchTerm);
      } catch (error) {
        log.error('Error handling search:', error);
        throw error;
      }
    });

    // Handle import request
    ipcMain.on('import', async (event) => {
      try {
        const result = await this.historyService.importFromBrowser();
        this.mainWindow.send('import-complete', result);
      } catch (error) {
        log.error('Error handling import:', error);
        this.mainWindow.send('import-complete', null);
      }
    });

    // Handle reset history
    ipcMain.on('reset-history', async (event) => {
      try {
        await this.historyService.resetHistory();
        this.mainWindow.send('reset-complete', { success: true });
      } catch (error) {
        log.error('Error resetting history:', error);
        this.mainWindow.send('reset-complete', { success: false, error: error.message });
      }
    });

    // Handle URL opening
    ipcMain.on('open-url', (event, url) => {
      require('electron').shell.openExternal(url);
    });

    // Handle window resizing
    ipcMain.on('resize-window', (event, { width, height }) => {
      if (this.mainWindow && this.mainWindow.window) {
        this.mainWindow.window.setSize(width, height);
      }
    });

    // Handle search history
    ipcMain.on('search-history', async (event, searchTerm) => {
      try {
        const results = await this.historyService.search(searchTerm);
        this.mainWindow.send('search-results', results);
      } catch (error) {
        log.error('Error searching history:', error);
        this.mainWindow.send('search-results', []);
      }
    });

    // Handle window visibility
    ipcMain.on('toggle-window', (event, shouldShow) => {
      if (shouldShow) {
        this.mainWindow.show();
      } else {
        this.mainWindow.hide();
      }
    });
  }
}

module.exports = IpcHandlers; 