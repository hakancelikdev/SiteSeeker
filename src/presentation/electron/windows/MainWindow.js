const path = require('path');

const { BrowserWindow, screen, nativeTheme, ipcMain, app } = require('electron');
const log = require('electron-log');

const WindowPositionRepository = require('../../../infrastructure/persistence/WindowPositionRepository');

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

    // Kaydedilmiş pozisyonu yükle
    const savedPosition = await this.loadWindowPosition();
    let x, y;

    if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
      // Ekran sınırlarını kontrol et
      const isOutOfBounds =
        savedPosition.x + windowWidth < 0 || // Pencere tamamen ekranın solunda
        savedPosition.x > screenWidth || // Pencere tamamen ekranın sağında
        savedPosition.y + windowHeight < 0 || // Pencere tamamen ekranın üstünde
        savedPosition.y > screenHeight; // Pencere tamamen ekranın altında

      if (isOutOfBounds) {
        // Pencere ekranın dışındaysa sol tarafa yerleştir
        x = 20; // Sol taraftan 20px boşluk
        y = Math.min(
          Math.max(20, savedPosition.y), // Üstten en az 20px boşluk
          screenHeight - windowHeight - 20 // Alttan en az 20px boşluk
        );
      } else {
        // Pencere ekranın içindeyse kaydedilen pozisyonda göster
        x = savedPosition.x;
        y = savedPosition.y;
      }
    } else {
      // Eğer kaydedilmiş pozisyon yoksa veya geçersizse, sol tarafta göster
      x = 20; // Sol taraftan 20px boşluk
      y = Math.floor((screenHeight - windowHeight) / 2); // Dikey olarak ortala
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

    // Pencere sürükleme işlemleri için
    this.window.setMovable(true);
    this.window.setMinimizable(false);
    this.window.setMaximizable(false);

    // Pencere pozisyonunu kaydetmek için
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

    // Pencere gizlendiğinde pozisyonu kaydet
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
      // Eğer sistem güncellemesi veya zorla kapatma varsa, pencereyi kapat
      if (this.isQuitting || process.platform === 'darwin' && app.isQuitting) {
        return;
      }

      // Normal kapatma işleminde pencereyi gizle
      event.preventDefault();
      this.window.hide();
    });

    this.window.on('closed', () => {
      log.info('Window closed');
      this.window = null;
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
      // Pencereyi göster ve odakla
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
      // Pencere gizlenmeden önce pozisyonu kaydet
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
      // Tüm event listener'ları temizle
      this.window.removeAllListeners('moved');
      this.window.removeAllListeners('hide');
      this.window.removeAllListeners('blur');
      this.window.removeAllListeners('close');
      this.window.removeAllListeners('closed');

      // Pencereyi kapat
      this.window.destroy();
      this.window = null;
    }

    // Veritabanı bağlantısını kapat
    if (this.windowPositionRepository) {
      this.windowPositionRepository.close();
    }
  }

  cleanup() {
    log.info('Cleaning up window resources...');
    try {
      // Tüm event listener'ları temizle
      if (this.window) {
        this.window.removeAllListeners();
        this.window.webContents.removeAllListeners();
      }

      // Veritabanı bağlantısını kapat
      if (this.windowPositionRepository) {
        this.windowPositionRepository.close();
      }

      // Pencereyi kapat
      this.destroy();

      log.info('Window cleanup completed successfully');
    } catch (error) {
      log.error('Error during window cleanup:', error);
    }
  }
}

module.exports = MainWindow;
