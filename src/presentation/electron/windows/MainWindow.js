const path = require('path');

const { BrowserWindow, screen, nativeTheme, ipcMain, app } = require('electron');
const log = require('electron-log');

const WindowPositionRepository = require('../../../infrastructure/persistence/repositories/WindowPositionRepository');

class MainWindow {
  constructor() {
    this.window = null;
    this.isQuitting = false;
    this.windowPositionRepository = new WindowPositionRepository();
    this.isCommandKeyPressed = false;
  }

  async saveWindowPosition(x, y) {
    try {
      // If x and y are not provided, get them from window position
      if (x === undefined || y === undefined) {
        [x, y] = this.window.getPosition();
      }

      await this.windowPositionRepository.savePosition(x, y);
      log.info('Window position saved successfully:', { x, y });
    } catch (error) {
      log.error('Error saving window position:', error);
    }
  }

  async loadWindowPosition() {
    try {
      const position = await this.windowPositionRepository.getLatestPosition();
      log.info('Loading window position:', position);
      return position;
    } catch (error) {
      log.error('Error loading window position:', error);
      return null;
    }
  }

  async create() {
    if (this.window) {
      return this.window;
    }

    log.info('Creating main window...');

    const preloadPath = path.join(__dirname, '../preload.js');
    log.info('Preload script path:', preloadPath);

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 700;
    const windowHeight = 500;

    // Load saved position
    const savedPosition = await this.loadWindowPosition();
    let x, y;

    if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
      // Check screen boundaries
      const isOutOfBounds =
        savedPosition.x + windowWidth < 0 || // Window is completely to the left of the screen
        savedPosition.x > screenWidth || // Window is completely to the right of the screen
        savedPosition.y + windowHeight < 0 || // Window is completely above the screen
        savedPosition.y > screenHeight; // Window is completely below the screen

      if (isOutOfBounds) {
        // If window is outside screen, place it on the left side
        x = 20; // 20px margin from left
        y = Math.min(
          Math.max(20, savedPosition.y), // At least 20px margin from top
          screenHeight - windowHeight - 20 // At least 20px margin from bottom
        );
      } else {
        // If window is inside screen, show at saved position
        x = savedPosition.x;
        y = savedPosition.y;
      }
    } else {
      // If no saved position or invalid, show on the left side
      x = 20; // 20px margin from left
      y = Math.floor((screenHeight - windowHeight) / 2); // Center vertically
    }

    log.info('Creating window with position:', { x, y });

    this.window = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      skipTaskbar: true,
      alwaysOnTop: true,
      resizable: false,
      frame: false,
      show: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath
      }
    });

    // For window dragging operations
    this.window.setMovable(true);
    this.window.setMinimizable(false);
    this.window.setMaximizable(false);

    // To save window position
    let saveTimeout;
    this.window.on('moved', () => {
      // Debounce the save operation to prevent multiple saves
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const [x, y] = this.window.getPosition();
        log.info('Window moved event triggered:', { x, y });
        this.saveWindowPosition(x, y);
      }, 100);
    });

    // Save position when window is hidden
    this.window.on('hide', () => {
      const [x, y] = this.window.getPosition();
      log.info('Window hide event triggered:', { x, y });
      this.saveWindowPosition(x, y);
    });

    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'floating');
    this.window.setSkipTaskbar(true);
    this.window.setWindowButtonVisibility(false);

    const htmlPath = path.join(__dirname, '../views/index.html');
    log.info('Loading HTML file:', htmlPath);

    await this.window.loadFile(htmlPath);

    // Wait for window to load before applying theme
    this.window.webContents.on('did-finish-load', () => {
      log.info('Window loaded successfully');
      this.applySystemTheme();
      // Request initial counts
      ipcMain.emit('get-url-count');
    });

    // Remove the auto-center on show event
    this.window.removeAllListeners('show');
    this.window.on('show', () => {
      log.info('Window shown successfully');
    });

    // Listen for theme changes
    nativeTheme.on('updated', () => {
      this.applySystemTheme();
    });

    if (process.env.NODE_ENV === 'development') {
      log.info('Opening DevTools in development mode');
      this.window.webContents.openDevTools();
    }

    this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load window:', errorCode, errorDescription);
    });

    this.window.on('close', (event) => {
      // If system update or force quit, close the window
      if (this.isQuitting || process.platform === 'darwin' && app.isQuitting) {
        return;
      }

      // On normal close, hide the window
      event.preventDefault();
      this.window.hide();
    });

    this.window.on('closed', () => {
      log.info('Window closed');
      this.window = null;
    });

    // Add listeners only once
    this.window.webContents.removeAllListeners('before-input-event');
    this.window.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        this.window.hide();
      }
    });
    this.window.removeAllListeners('blur');
    this.window.on('blur', () => {
      // Only hide if Command key is not pressed
      if (!this.isCommandKeyPressed) {
        this.window.hide();
        this.saveWindowPosition();
      }
    });

    // Track Command key state
    this.isCommandKeyPressed = false;
    this.window.webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'command-key-state') {
        this.isCommandKeyPressed = args[0];
      }
    });

    return this.window;
  }

  applySystemTheme() {
    if (!this.window) return;

    const isDarkMode = nativeTheme.shouldUseDarkColors;
    log.info(`Applying system theme: ${isDarkMode ? 'dark' : 'light'}`);

    // Send theme change to renderer
    this.window.webContents.send('theme-changed', { isDarkMode });
  }

  toggle() {
    if (this.window && this.window.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  async show() {
    if (!this.window) {
      await this.create();
    }

    try {
      // Show window and focus
      this.window.show();
      this.window.focus();
      log.info('Window shown successfully');
    } catch (error) {
      log.error('Error showing window:', error);
      this.window.show();
      this.window.focus();
    }
  }

  hide() {
    if (this.window) {
      // Save position before hiding window
      const [x, y] = this.window.getPosition();
      log.info('Window hiding, saving position:', { x, y });
      this.saveWindowPosition(x, y);
      this.window.hide();
      log.info('Window hidden successfully');
    }
  }

  get webContents() {
    return this.window ? this.window.webContents : null;
  }

  send(channel, ...args) {
    if (this.window && this.webContents) {
      this.webContents.send(channel, ...args);
    }
  }

  setQuitting(isQuitting) {
    this.isQuitting = isQuitting;
    if (isQuitting && this.window) {
      this.window.close();
    }
  }

  destroy() {
    if (this.window) {
      // Clear all event listeners
      this.window.removeAllListeners('moved');
      this.window.removeAllListeners('hide');
      this.window.removeAllListeners('blur');
      this.window.removeAllListeners('close');
      this.window.removeAllListeners('closed');

      // Close window
      this.window.destroy();
      this.window = null;
    }
  }

  cleanup() {
    log.info('Cleaning up window resources...');
    try {
      // Clear all event listeners
      if (this.window) {
        this.window.removeAllListeners();
        this.window.webContents.removeAllListeners();
      }

      // Close database connection
      if (this.windowPositionRepository) {
        this.windowPositionRepository.close();
      }

      // Close window
      this.destroy();

      log.info('Window cleanup completed successfully');
    } catch (error) {
      log.error('Error during window cleanup:', error);
    }
  }
}

module.exports = MainWindow;
