const path = require('path');
const { BrowserWindow, screen, nativeTheme } = require('electron');
const log = require('electron-log');

class PermissionDialogWindow {
  constructor() {
    this.window = null;
  }

  async create() {
    if (this.window) {
      return this.window;
    }

    log.info('Creating permission dialog window...');

    const preloadPath = path.join(__dirname, '../preload.js');
    log.info('Preload script path:', preloadPath);

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 520;
    const windowHeight = 640;

    // Center the window on screen with more precise positioning
    const x = Math.round((screenWidth - windowWidth) / 2);
    const y = Math.round((screenHeight - windowHeight) / 2);

    log.info('Creating permission dialog window with position:', { x, y });

    this.window = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      resizable: false,
      frame: true,
      show: false,
      transparent: false,
      modal: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath
      }
    });

    // Set window properties
    this.window.setAlwaysOnTop(true);
    this.window.setSkipTaskbar(false);
    this.window.setWindowButtonVisibility(true);

    const htmlPath = path.join(__dirname, '../views/permission-dialog.html');
    log.info('Loading permission dialog HTML file:', htmlPath);

    await this.window.loadFile(htmlPath);

    // Wait for window to load before applying theme
    this.window.webContents.on('did-finish-load', () => {
      log.info('Permission dialog window loaded successfully');
      this.applySystemTheme();
    });

    // Listen for theme changes
    nativeTheme.on('updated', () => {
      this.applySystemTheme();
    });

    if (process.env.NODE_ENV === 'development') {
      log.info('Opening DevTools for permission dialog in development mode');
      this.window.webContents.openDevTools();
    }

    this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load permission dialog window:', errorCode, errorDescription);
    });

    this.window.on('closed', () => {
      log.info('Permission dialog window closed');
      this.window = null;
    });

    return this.window;
  }

  applySystemTheme() {
    if (!this.window) return;

    const isDarkMode = nativeTheme.shouldUseDarkColors;
    log.info(`Applying system theme to permission dialog: ${isDarkMode ? 'dark' : 'light'}`);
    
    // Send theme change to renderer
    this.window.webContents.send('theme-changed', { isDarkMode });
  }

  show() {
    if (this.window) {
      this.window.show();
      this.window.focus();
    }
  }

  hide() {
    if (this.window) {
      this.window.hide();
    }
  }

  close() {
    if (this.window) {
      this.window.close();
    }
  }

  get webContents() {
    return this.window ? this.window.webContents : null;
  }

  send(channel, ...args) {
    if (this.window && this.window.webContents) {
      this.window.webContents.send(channel, ...args);
    }
  }

  destroy() {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }

  cleanup() {
    this.destroy();
  }
}

module.exports = PermissionDialogWindow; 