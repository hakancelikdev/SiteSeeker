const { app, globalShortcut } = require('electron');
const log = require('electron-log');
const MainWindow = require('../../presentation/electron/windows/MainWindow');
const IpcHandlers = require('../../presentation/electron/handlers/IpcHandlers');
const UpdateHandlers = require('../../presentation/electron/handlers/UpdateHandlers');
const PermissionService = require('../../infrastructure/permissions/PermissionService');
const BookmarkService = require('../../domain/services/BookmarkService');

class ApplicationService {
  constructor(historyService, bookmarkService) {
    this.historyService = historyService;
    this.bookmarkService = bookmarkService;
    this.mainWindow = new MainWindow();
    this.ipcHandlers = new IpcHandlers(historyService, bookmarkService, this.mainWindow);
    this.updateHandlers = new UpdateHandlers(this.mainWindow);
    this.permissionService = new PermissionService(this.mainWindow);
    
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
        this.mainWindow.setQuitting(true);
      });

      // Setup auto start
      this.setupAutoStart();

      // Check permissions before starting history import
      if (this.permissionService.checkPermissions()) {
        // Start history import
        await this.startHistoryImport();
      }
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

  async startHistoryImport() {
    let isFirstRun = true;

    const importHistory = async () => {
      try {
        if (isFirstRun) {
          log.info('Starting initial history import...');
          const result = await this.historyService.importFromBrowser();
          if (result > 0) {
            log.info(`Initial history import successful. Total records: ${result}`);
            // Update UI with imported count
            if (this.mainWindow) {
              this.mainWindow.send('import-complete', result);
              this.mainWindow.send('update-url-count', result);
            }
          } else {
            log.error('Initial history import failed: No records imported');
          }
          isFirstRun = false;
        } else {
          const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
          const result = await this.historyService.importRecentHistory(twoMinutesAgo);
          if (result > 0) {
            log.info(`Incremental import successful. New records: ${result}`);
            // Update UI with new count
            if (this.mainWindow) {
              this.mainWindow.send('update-url-count', result);
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
          log.info('Starting initial bookmark import...');
          const result = await this.bookmarkService.importFromBrowser();
          if (result > 0) {
            log.info(`Initial bookmark import successful. Total records: ${result}`);
            // Update UI with imported count
            if (this.mainWindow) {
              this.mainWindow.send('bookmark-import-complete', result);
            }
          } else {
            log.error('Initial bookmark import failed: No records imported');
          }
          isFirstRun = false;
        } else {
          const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
          const result = await this.bookmarkService.importRecentBookmarks(twoMinutesAgo);
          if (result > 0) {
            log.info(`Incremental bookmark import successful. New records: ${result}`);
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
    return await this.historyService.search(searchTerm);
  }

  async importFromBrowser() {
    const historyCount = await this.historyService.importFromBrowser();
    const bookmarkCount = await this.bookmarkService.importFromBrowser();
    return { historyCount, bookmarkCount };
  }

  async resetHistory() {
    await this.historyService.resetHistory();
    await this.bookmarkService.resetBookmarks();
  }

  async getUrlCount() {
    return await this.historyService.getUrlCount();
  }
}

module.exports = ApplicationService; 