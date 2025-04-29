const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

class UpdateHandlers {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupLogger();
  }

  setupLogger() {
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
  }

  setup() {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.mainWindow.send('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
    });

    autoUpdater.on('error', (error) => {
      log.error('Update error:', error);
      this.mainWindow.send('update-error', error.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded: ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      log.info(message);
      this.mainWindow.send('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.mainWindow.send('update-downloaded', info);
      autoUpdater.quitAndInstall();
    });

    // Check for updates
    this.checkForUpdates();
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      log.error('Error checking for updates:', error);
    }
  }
}

module.exports = UpdateHandlers;
