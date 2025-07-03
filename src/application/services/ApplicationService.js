const { app, globalShortcut } = require('electron');
const path = require('path');
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
    this.mainWindow = null; // Will be created after permission is granted
    this.ipcHandlers = null; // Will be created after permission is granted
    this.updateHandlers = null; // Will be created after permission is granted

    // Bind methods to maintain context
    this.handleWindowAllClosed = this.handleWindowAllClosed.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
  }

  async initialize() {
    try {
      log.info('Initializing basic application services...');

      await app.whenReady();

      // Setup basic app event handlers
      app.on('window-all-closed', this.handleWindowAllClosed);
      app.on('activate', this.handleActivate);

      // Handle app quit
      app.on('before-quit', () => {
        // Unregister shortcut if registered
        globalShortcut.unregisterAll();
        app.isQuitting = true;
        if (this.mainWindow) {
          this.mainWindow.setQuitting(true);
        }
      });

      // Handle force quit
      app.on('quit', () => {
        log.info('Application is quitting...');
        // Ensure all resources are cleaned up
        this.cleanup();
      });

      // Setup auto start
      this.setupAutoStart();

      // Note: Main window, IPC handlers, and global shortcut will be initialized after permission is granted
      // this.mainWindow.create();
      // this.ipcHandlers.setup();
      // this.updateHandlers.setup();
      // this.registerGlobalShortcut();

      log.info('Basic application services initialized successfully');
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
    if (this.mainWindow) {
      this.mainWindow.show();
    }
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

  async startImportAfterPermission() {
    try {
      log.info('Starting full application services after permission granted...');
      
      // Create main window
      this.mainWindow = new MainWindow();
      this.mainWindow.create();
      
      // Create and setup IPC handlers
      this.ipcHandlers = new IpcHandlers(this.historyService, this.bookmarkService, this, this.mainWindow);
      this.ipcHandlers.setup();
      
      // Create and setup update handlers
      this.updateHandlers = new UpdateHandlers(this.mainWindow);
      this.updateHandlers.setup();
      
      // Register global shortcut
      this.registerGlobalShortcut();
      
      // Start initial import
      await this.importBrowserData();

      // Start periodic imports
      this.startPeriodicImports();

      log.info('Full application services started successfully after permission');
    } catch (error) {
      log.error('Error starting application services after permission:', error);
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
      log.error('Error searching:', error);
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

  async hasStoredBrowserDataPaths() {
    try {
      const storedPaths = this.store.get('browserDataPaths');
      return storedPaths && storedPaths.length > 0;
    } catch (error) {
      log.error('Error checking stored browser data paths:', error);
      return false;
    }
  }

  async storeBrowserDataPaths(selectedPath) {
    try {
      log.info('Storing browser data paths:', selectedPath);
      
      // Store the selected path
      this.store.set('browserDataPaths', [selectedPath]);
      
      // Also update the browser providers with the new path
      await this.updateBrowserProvidersWithPath(selectedPath);
      
      log.info('Browser data paths stored successfully');
    } catch (error) {
      log.error('Error storing browser data paths:', error);
      throw error;
    }
  }

  async updateBrowserProvidersWithPath(selectedPath) {
    try {
      log.info('Updating browser providers with path:', selectedPath);
      
      // Update Chrome provider
      const ChromeHistoryProvider = require('../../infrastructure/browsers/history/providers/ChromeHistoryProvider');
      const ChromeBookmarkProvider = require('../../infrastructure/browsers/bookmark/providers/ChromeBookmarkProvider');
      
      // Update Firefox provider
      const FirefoxHistoryProvider = require('../../infrastructure/browsers/history/providers/FirefoxHistoryProvider');
      const FirefoxBookmarkProvider = require('../../infrastructure/browsers/bookmark/providers/FirefoxBookmarkProvider');
      
      // Store the custom path for each provider
      this.store.set('chromeHistoryPath', selectedPath);
      this.store.set('chromeBookmarkPath', selectedPath);
      this.store.set('firefoxHistoryPath', selectedPath);
      this.store.set('firefoxBookmarkPath', selectedPath);
      
      log.info('Browser providers updated with custom path');
    } catch (error) {
      log.error('Error updating browser providers:', error);
      throw error;
    }
  }

  async getCustomBrowserDataPaths() {
    try {
      const storedPaths = this.store.get('browserDataPaths', []);
      return storedPaths;
    } catch (error) {
      log.error('Error getting custom browser data paths:', error);
      return [];
    }
  }

  async storeDefaultBrowserDataPaths() {
    try {
      log.info('Storing default browser data paths...');
      
      // Get the default paths from the system
      const homeDir = require('os').homedir();
      const defaultPaths = [
        path.join(homeDir, 'Library/Application Support/Google/Chrome'),
        path.join(homeDir, 'Library/Application Support/Firefox/Profiles')
      ];
      
      // Store the default paths
      this.store.set('browserDataPaths', defaultPaths);
      
      // Also update the browser providers with the default paths
      this.store.set('chromeHistoryPath', defaultPaths[0]);
      this.store.set('chromeBookmarkPath', defaultPaths[0]);
      this.store.set('firefoxHistoryPath', defaultPaths[1]);
      this.store.set('firefoxBookmarkPath', defaultPaths[1]);
      
      log.info('Default browser data paths stored successfully');
    } catch (error) {
      log.error('Error storing default browser data paths:', error);
      throw error;
    }
  }

  async getBrowserDataPaths() {
    try {
      log.info('Getting browser data paths...');
      
      const homeDir = require('os').homedir();
      log.info('Home directory:', homeDir);
      
      const chromePath = path.join(homeDir, 'Library/Application Support/Google/Chrome');
      const firefoxPath = path.join(homeDir, 'Library/Application Support/Firefox/Profiles');
      
      log.info('Chrome path:', chromePath);
      log.info('Firefox path:', firefoxPath);
      
      const paths = [
        {
          path: chromePath,
          browser: 'Chrome'
        },
        {
          path: firefoxPath,
          browser: 'Firefox'
        }
      ];
      
      log.info('Browser data paths array:', paths);
      return paths;
    } catch (error) {
      log.error('Error getting browser data paths:', error);
      return [];
    }
  }
}

module.exports = ApplicationService;
