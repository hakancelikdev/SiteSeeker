const { app, globalShortcut } = require('electron');
const log = require('electron-log');

const ElectronStore = require('../../infrastructure/persistence/ElectronStore');
const HistoryService = require('../../domain/services/HistoryService');
const BookmarkService = require('../../domain/services/BookmarkService');
const HistoryRepository = require('../../domain/repositories/HistoryRepository');
const MainWindow = require('../../presentation/electron/windows/MainWindow');
const IpcHandlers = require('../../presentation/electron/handlers/IpcHandlers');
const UpdateHandlers = require('../../presentation/electron/handlers/UpdateHandlers');

class ApplicationService {
  constructor() {
    this.store = new ElectronStore();
    this.historyRepository = new HistoryRepository(this.store);
    this.historyService = new HistoryService(this.historyRepository);
    this.bookmarkService = new BookmarkService(this.historyRepository);
    this.mainWindow = new MainWindow();
    this.ipcHandlers = new IpcHandlers(this.historyService, this.bookmarkService, this, this.mainWindow);
    this.updateHandlers = new UpdateHandlers(this.mainWindow);

    // Bind methods to maintain context
    this.handleWindowAllClosed = this.handleWindowAllClosed.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
  }

  async initialize() {
    try {
      log.info('Initializing application services...');

      await app.whenReady();

      this.mainWindow.create();
      this.ipcHandlers.setup();
      this.updateHandlers.setup();

      // Register global shortcut
      this.registerGlobalShortcut();

      app.on('window-all-closed', this.handleWindowAllClosed);
      app.on('activate', this.handleActivate);

      // Handle app quit
      app.on('before-quit', () => {
        // Unregister shortcut
        globalShortcut.unregisterAll();
        app.isQuitting = true;
        this.mainWindow.setQuitting(true);
      });

      // Handle force quit
      app.on('quit', () => {
        log.info('Application is quitting...');
        // Ensure all resources are cleaned up
        this.cleanup();
      });

      // Setup auto start
      this.setupAutoStart();

      // Start initial import
      await this.importBrowserData();

      // Start periodic imports
      this.startPeriodicImports();

      log.info('Application services initialized successfully');
    } catch (error) {
      log.error('Failed to initialize application services:', error);
      app.quit();
    }
  }

  handleWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  handleActivate() {
    this.mainWindow.show();
  }

  setupAutoStart() {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: app.getPath('exe')
    });
  }

  registerGlobalShortcut() {
    const shortcut = process.platform === 'darwin' ? 'Command+Shift+Space' : 'Control+Shift+Space';

    const success = globalShortcut.register(shortcut, () => {
      this.mainWindow.toggle();
    });

    if (!success) {
      log.error('Failed to register global shortcut');
    } else {
      log.info('Global shortcut registered successfully');
    }
  }

  async importBrowserData() {
    try {
      log.info('Starting browser data import...');

      // Import history
      log.info('Starting history import...');
      const historyCount = await this.historyService.importFromBrowser();
      if (this.mainWindow) {
        this.mainWindow.send('history-updated', historyCount);
      }

      // Import bookmarks
      log.info('Starting bookmark import...');
      const bookmarkCount = await this.bookmarkService.importFromBrowser();
      if (this.mainWindow) {
        this.mainWindow.send('bookmarks-updated', bookmarkCount);
      }

      // Get final counts after all imports
      const finalHistoryCount = await this.historyService.getUrlCount();
      const finalBookmarkCount = await this.bookmarkService.getBookmarkCount();

      log.info(`Import completed. History: ${finalHistoryCount}, Bookmarks: ${finalBookmarkCount}`);
      return { historyCount: finalHistoryCount, bookmarkCount: finalBookmarkCount };
    } catch (error) {
      log.error('Error importing browser data:', error);
      throw error;
    }
  }

  async startHistoryImport() {
    let isFirstRun = true;

    const importHistory = async () => {
      try {
        if (isFirstRun) {
          log.info('Starting initial browser data import...');
          await this.importBrowserData();
          isFirstRun = false;
        } else {
          const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
          const result = await this.historyService.importRecentHistory(twoMinutesAgo);
          if (result > 0) {
            log.info(`Incremental import successful. New records: ${result}`);
            if (this.mainWindow) {
              this.mainWindow.send('history-updated', result);
            }
          }
        }
      } catch (error) {
        log.error('Automatic history import error:', error);
      }
    };

    // Run initial import
    await importHistory();

    // Schedule periodic imports every minute
    setInterval(importHistory, 60000);
  }

  async startBookmarkImport() {
    let isFirstRun = true;

    const importBookmarks = async () => {
      try {
        if (isFirstRun) {
          log.info('Starting initial browser data import...');
          await this.importBrowserData();
          isFirstRun = false;
        } else {
          const result = await this.bookmarkService.importRecentBookmarks();
          if (result > 0) {
            log.info(`Bookmark import successful. Total records: ${result}`);
            if (this.mainWindow) {
              this.mainWindow.send('bookmarks-updated', result);
            }
          }
        }
      } catch (error) {
        log.error('Automatic bookmark import error:', error);
      }
    };

    // Run initial import
    await importBookmarks();

    // Schedule periodic imports every minute
    setInterval(importBookmarks, 60000);
  }

  async search(searchTerm) {
    try {
      const results = await this.historyService.search(searchTerm);
      return results;
    } catch (error) {
      log.error('Search error:', error);
      throw error;
    }
  }

  async importFromBrowser() {
    try {
      const historyCount = await this.historyService.importFromBrowser();
      const bookmarkCount = await this.bookmarkService.importFromBrowser();
      return { historyCount, bookmarkCount };
    } catch (error) {
      log.error('Import error:', error);
      throw error;
    }
  }

  async resetHistory() {
    await this.historyService.resetHistory();
    await this.bookmarkService.resetBookmarks();
  }

  async getUrlCount() {
    return await this.historyService.getUrlCount();
  }

  async cleanup() {
    try {
      log.info('Starting application cleanup...');

      // Clean up IPC handlers
      log.info('Cleaning up IPC handlers...');
      this.ipcHandlers.cleanup();
      log.info('IPC handlers cleaned up successfully');

      // Clean up update handlers
      log.info('Cleaning up update handlers...');
      this.updateHandlers.cleanup();
      log.info('Update handlers cleaned up successfully');

      // Clean up window resources
      log.info('Cleaning up window resources...');
      this.mainWindow.cleanup();
      log.info('Window cleanup completed successfully');

      // Clean up history service
      log.info('Cleaning up history service...');
      await this.historyService.cleanup();
      log.info('History service cleaned up successfully');

      // Clean up bookmark service
      log.info('Cleaning up bookmark service...');
      await this.bookmarkService.cleanup();
      log.info('Bookmark service cleaned up successfully');

      log.info('Application cleanup completed successfully');
    } catch (error) {
      log.error('Error during application services cleanup:', error);
      throw error;
    }
  }

  startPeriodicImports() {
    // Schedule periodic imports every minute
    setInterval(async () => {
      try {
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);

        // Import recent history
        const historyResult = await this.historyService.importRecentHistory(twoMinutesAgo);
        if (historyResult > 0) {
          log.info(`Incremental history import successful. New records: ${historyResult}`);
          if (this.mainWindow) {
            this.mainWindow.send('history-updated', historyResult);
          }
        }

        // Import recent bookmarks
        const bookmarkResult = await this.bookmarkService.importRecentBookmarks();
        if (bookmarkResult > 0) {
          log.info(`Bookmark import successful. Total records: ${bookmarkResult}`);
          if (this.mainWindow) {
            this.mainWindow.send('bookmarks-updated', bookmarkResult);
          }
        }
      } catch (error) {
        log.error('Periodic import error:', error);
      }
    }, 60000);
  }
}

module.exports = ApplicationService;
