const path = require('path');

const { BrowserWindow, screen } = require('electron');
const log = require('electron-log');

class MainWindow {
  constructor() {
    this.windows = new Map(); // Her Space için ayrı pencere tutacak Map
    this.isQuitting = false;
  }

  getCurrentDisplay() {
    return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  }

  getWindowForDisplay(display) {
    return this.windows.get(display.id);
  }

  create(display = null) {
    // Eğer display parametresi verilmemişse, aktif display'i al
    const currentDisplay = display || this.getCurrentDisplay();
    const displayId = currentDisplay.id;

    if (!this.windows.has(displayId)) {
      log.info(`Creating window for display ${displayId}...`);

      const preloadPath = path.join(__dirname, '../preload.js');
      log.info('Preload script path:', preloadPath);

      const { width: screenWidth, height: screenHeight } = currentDisplay.workAreaSize;
      const windowWidth = 700;
      const windowHeight = 500;

      // Calculate initial position for the display
      const x = Math.floor(currentDisplay.bounds.x + (screenWidth - windowWidth) / 2);
      const y = Math.floor(currentDisplay.bounds.y + (screenHeight - windowHeight) / 2);

      const window = new BrowserWindow({
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

      const htmlPath = path.join(__dirname, '../views/index.html');
      log.info('Loading HTML file:', htmlPath);

      window.loadFile(htmlPath);

      if (process.env.NODE_ENV === 'development') {
        log.info('Opening DevTools in development mode');
        window.webContents.openDevTools();
      }

      window.webContents.on('did-finish-load', () => {
        log.info(`Window loaded successfully for display ${displayId}`);
      });

      window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log.error(`Failed to load window for display ${displayId}:`, errorCode, errorDescription);
      });

      window.on('close', (event) => {
        if (!this.isQuitting) {
          event.preventDefault();
          window.hide();
        }
      });

      window.on('closed', () => {
        log.info(`Window closed for display ${displayId}`);
        this.windows.delete(displayId);
      });

      // Center window on show
      window.on('show', () => {
        try {
          const [currentWidth, currentHeight] = window.getSize();
          const newX = Math.floor(currentDisplay.bounds.x + (currentDisplay.workAreaSize.width - currentWidth) / 2);
          const newY = Math.floor(currentDisplay.bounds.y + (currentDisplay.workAreaSize.height - currentHeight) / 2);

          window.setPosition(newX, newY);
          log.info(`Window shown and centered for display ${displayId} at:`, { x: newX, y: newY });
        } catch (error) {
          log.error(`Error centering window for display ${displayId}:`, error);
        }
      });

      this.windows.set(displayId, window);
      log.info(`Window created successfully for display ${displayId}`);
    }

    return this.windows.get(displayId);
  }

  toggle() {
    const currentDisplay = this.getCurrentDisplay();
    const window = this.getWindowForDisplay(currentDisplay);

    if (window && window.isVisible()) {
      this.hide(currentDisplay);
    } else {
      this.show();
    }
  }

  show() {
    const currentDisplay = this.getCurrentDisplay();
    let window = this.getWindowForDisplay(currentDisplay);

    if (!window) {
      window = this.create(currentDisplay);
    }

    window.show();
    log.info(`Window shown for display ${currentDisplay.id}`);
  }

  hide(display) {
    const window = this.getWindowForDisplay(display);
    if (window) {
      window.hide();
      log.info(`Window hidden for display ${display.id}`);
    }
  }

  send(channel, ...args) {
    const currentDisplay = this.getCurrentDisplay();
    const window = this.getWindowForDisplay(currentDisplay);

    if (window) {
      log.info(`Sending message to window on display ${currentDisplay.id}:`, channel, args);
      window.webContents.send(channel, ...args);
    } else {
      log.error(`Cannot send message - no window for display ${currentDisplay.id}:`, channel);
    }
  }

  setQuitting(isQuitting) {
    this.isQuitting = isQuitting;
    log.info('Quitting state set to:', isQuitting);

    if (isQuitting) {
      // Tüm pencereleri kapat
      for (const [displayId, window] of this.windows) {
        log.info(`Closing window for display ${displayId}`);
        window.close();
      }
      this.windows.clear();
    }
  }
}

module.exports = MainWindow;
