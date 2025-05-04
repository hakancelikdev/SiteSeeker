const path = require('path');

const { BrowserWindow, screen, nativeTheme } = require('electron');
const log = require('electron-log');

class MainWindow {
  constructor() {
    this.window = null;
    this.isQuitting = false;
  }

  create() {
    if (this.window) {
      return this.window;
    }

    log.info('Creating main window...');

    const preloadPath = path.join(__dirname, '../preload.js');
    log.info('Preload script path:', preloadPath);

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 700;
    const windowHeight = 500;

    // Calculate initial position for the display
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = Math.floor((screenHeight - windowHeight) / 2);

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

    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'floating');
    this.window.setSkipTaskbar(true);
    this.window.setWindowButtonVisibility(false);

    const htmlPath = path.join(__dirname, '../views/index.html');
    log.info('Loading HTML file:', htmlPath);

    this.window.loadFile(htmlPath);

    // Wait for window to load before applying theme
    this.window.webContents.on('did-finish-load', () => {
      log.info('Window loaded successfully');
      // Apply system theme after window is loaded
      this.applySystemTheme();
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
      if (!this.isQuitting) {
        event.preventDefault();
        this.window.hide();
      }
    });

    this.window.on('closed', () => {
      log.info('Window closed');
      this.window = null;
    });

    // Center window on show
    this.window.on('show', () => {
      try {
        const [currentWidth, currentHeight] = this.window.getSize();
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        const newX = Math.floor((screenWidth - currentWidth) / 2);
        const newY = Math.floor((screenHeight - currentHeight) / 2);

        this.window.setPosition(newX, newY);
        log.info('Window shown and centered at:', { x: newX, y: newY });
      } catch (error) {
        log.error('Error centering window:', error);
      }
    });

    // Listener'ları sadece bir kez ekle
    this.window.webContents.removeAllListeners('before-input-event');
    this.window.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        this.window.hide();
      }
    });
    this.window.removeAllListeners('blur');
    this.window.on('blur', () => {
      this.window.hide();
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

  show() {
    if (!this.window) {
      this.create();
    }
    this.window.show();
    this.window.focus();
  }

  hide() {
    if (this.window) {
      this.window.hide();
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
}

module.exports = MainWindow;
