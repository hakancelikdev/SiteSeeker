const fs = require('fs');
const path = require('path');
const os = require('os');

const { dialog } = require('electron');
const log = require('electron-log');

class PermissionService {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.permissions = {};
  }

  async checkPermission(path) {
    try {
      await fs.promises.access(path, fs.constants.R_OK);
      return true;
    } catch (error) {
      log.warn(`No permission for path: ${path}`, error);
      return false;
    }
  }

  async requestPermission(path) {
    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Permission Required',
        message: `Do you want to grant access to ${path}?`
      });

      if (result.response === 0) {
        return true;
      }
      return false;
    } catch (error) {
      log.error(`Failed to request permission for: ${path}`, error);
      return false;
    }
  }

  checkPermissions() {
    try {
      // Check Chrome history permissions
      const chromeHistoryPath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default/History');
      if (fs.existsSync(chromeHistoryPath)) {
        try {
          fs.accessSync(chromeHistoryPath, fs.constants.R_OK);
          log.info('Chrome history access permission available');
        } catch (error) {
          log.warn('No Chrome history access permission, requesting...', error);
          this.showPermissionDialog();
          return false;
        }
      }

      // Check Firefox history permissions
      const firefoxProfilesPath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
      if (fs.existsSync(firefoxProfilesPath)) {
        const profiles = fs.readdirSync(firefoxProfilesPath)
          .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
        
        for (const profile of profiles) {
          const historyPath = path.join(firefoxProfilesPath, profile, 'places.sqlite');
          if (fs.existsSync(historyPath)) {
            try {
              fs.accessSync(historyPath, fs.constants.R_OK);
              log.info('Firefox history access permission available');
            } catch (error) {
              log.warn('No Firefox history access permission, requesting...', error);
              this.showPermissionDialog();
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      log.error('Error during permission check:', error);
      return false;
    }
  }

  showPermissionDialog() {
    dialog.showMessageBox(this.mainWindow.window, {
      type: 'info',
      title: 'Full Disk Access Required',
      message: 'SiteSeeker needs full disk access to access browser history.',
      detail: 'Please allow SiteSeeker application access in System Settings > Privacy & Security > Full Disk Access.',
      buttons: ['OK'],
      defaultId: 0
    });
  }
}

module.exports = PermissionService; 