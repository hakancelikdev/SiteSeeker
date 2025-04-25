const { BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');

class MainWindow {
  constructor() {
    this.window = null;
    this.isQuitting = false;
    this.isVisible = false;
  }

  create() {
    if (this.window === null) {
      log.info('Creating main window...');
      
      const preloadPath = path.join(__dirname, '../preload.js');
      log.info('Preload script path:', preloadPath);

      this.window = new BrowserWindow({
        width: 800,
        height: 600,
        skipTaskbar: true,
        alwaysOnTop: true,
        resizable: false,
        frame: false,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: preloadPath
        }
      });

      const htmlPath = path.join(__dirname, '../views/index.html');
      log.info('Loading HTML file:', htmlPath);
      
      this.window.loadFile(htmlPath);
      
      // Development: Open DevTools
      if (process.env.NODE_ENV === 'development') {
        log.info('Opening DevTools in development mode');
        this.window.webContents.openDevTools();
      }

      this.window.webContents.on('did-finish-load', () => {
        log.info('Window loaded successfully');
      });

      this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log.error('Failed to load window:', errorCode, errorDescription);
      });

      this.window.on('close', (event) => {
        if (!this.isQuitting) {
          event.preventDefault();
          this.hide();
        }
      });

      this.window.on('closed', () => {
        log.info('Window closed');
        this.window = null;
      });

      // Center window on show
      this.window.on('show', () => {
        this.window.center();
        log.info('Window shown and centered');
      });

      log.info('Main window created successfully');
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.window === null) {
      this.create();
    }
    this.window.show();
    this.isVisible = true;
    log.info('Window shown');
  }

  hide() {
    if (this.window) {
      this.window.hide();
      this.isVisible = false;
      log.info('Window hidden');
    }
  }

  send(channel, ...args) {
    if (this.window) {
      log.info('Sending message to window:', channel, args);
      this.window.webContents.send(channel, ...args);
    } else {
      log.error('Cannot send message - window is null:', channel);
    }
  }

  setQuitting(isQuitting) {
    this.isQuitting = isQuitting;
    log.info('Quitting state set to:', isQuitting);
  }
}

module.exports = MainWindow; 