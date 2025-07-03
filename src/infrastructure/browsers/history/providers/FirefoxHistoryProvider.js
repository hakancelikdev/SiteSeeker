const path = require('path');
const fs = require('fs');
const os = require('os');

const { app } = require('electron');
const Database = require('better-sqlite3');
const log = require('electron-log');

const ElectronStore = require('../../../persistence/ElectronStore');
const BaseHistoryProvider = require('../BaseHistoryProvider');
const { INITIAL_SCORE } = require('../../../../domain/models/HistoryItem');

class FirefoxHistoryProvider extends BaseHistoryProvider {
  constructor() {
    super();
    this.electronStore = new ElectronStore();
    this.basePath = FirefoxHistoryProvider.getFirefoxBasePath();
    this.logInfo('FirefoxHistoryProvider initialized with base path: ' + this.basePath);
  }

  static getFirefoxBasePath() {
    // Check for custom path first
    const electronStore = new ElectronStore();
    const customPath = electronStore.get('firefoxHistoryPath');
    if (customPath && fs.existsSync(customPath)) {
      log.info('Using custom Firefox path: ' + customPath);
      return customPath;
    }

    // Fall back to default path
    const defaultPath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
    log.info('Using default Firefox path: ' + defaultPath);
    return defaultPath;
  }

  async getProfiles() {
    try {
      if (!fs.existsSync(this.basePath)) {
        this.logWarn('Firefox base path does not exist: ' + this.basePath);
        return [];
      }

      // If using custom path, check if it's a direct profile directory
      const customPath = this.electronStore.get('firefoxHistoryPath');
      if (customPath && customPath !== this.basePath) {
        // Check if the custom path itself is a profile directory
        const placesFile = path.join(customPath, 'places.sqlite');
        if (fs.existsSync(placesFile)) {
          this.logInfo('Custom path is a Firefox profile directory');
          return [path.basename(customPath)];
        }
      }

      const profiles = fs.readdirSync(this.basePath)
        .filter(item => {
          const itemPath = path.join(this.basePath, item);
          return fs.existsSync(itemPath) &&
                 fs.statSync(itemPath).isDirectory() &&
                 fs.existsSync(path.join(itemPath, 'places.sqlite'));
        });

      this.logInfo(`Found ${profiles.length} Firefox profiles`);
      return profiles;
    } catch (error) {
      this.logError('Error getting Firefox profiles:', error);
      return [];
    }
  }

  async importHistory(uniqueUrls = new Set(), fromTime = 0) {
    const allHistory = [];
    const profiles = await this.getProfiles();

    if (profiles.length === 0) {
      this.logWarn('No Firefox profiles found to import history from');
      return allHistory;
    }

    for (const profile of profiles) {
      try {
        let placesPath;
        const customPath = this.electronStore.get('firefoxHistoryPath');
        
        if (customPath && customPath !== this.basePath) {
          // Use custom path directly
          placesPath = path.join(customPath, 'places.sqlite');
        } else {
          // Use profile-based path
          placesPath = path.join(this.basePath, profile, 'places.sqlite');
        }

        const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);

        this.logInfo(`Importing Firefox history from profile: ${profile}`);

        if (!fs.existsSync(placesPath)) {
          this.logWarn(`Places file not found for profile ${profile}: ${placesPath}`);
          continue;
        }

        try {
          fs.copyFileSync(placesPath, tempPath);
        } catch (error) {
          this.logError(`Failed to copy Firefox places file for profile ${profile}:`, error);
          continue;
        }

        let db;
        try {
          db = new Database(tempPath, { readonly: true });
        } catch (error) {
          this.logError(`Failed to open Firefox places database for profile ${profile}:`, error);
          continue;
        }

        const query = fromTime === 0
          ? `SELECT moz_places.title, moz_places.url, moz_historyvisits.visit_date
             FROM moz_places
             JOIN moz_historyvisits ON moz_places.id = moz_historyvisits.place_id
             WHERE moz_places.title IS NOT NULL
             AND moz_places.title != ''
             ORDER BY moz_historyvisits.visit_date DESC`
          : `SELECT moz_places.title, moz_places.url, moz_historyvisits.visit_date
             FROM moz_places
             JOIN moz_historyvisits ON moz_places.id = moz_historyvisits.place_id
             WHERE moz_places.title IS NOT NULL
             AND moz_places.title != ''
             AND moz_historyvisits.visit_date/1000000 > ?
             ORDER BY moz_historyvisits.visit_date DESC`;

        try {
          const rows = db.prepare(query).all(fromTime === 0 ? [] : [Math.floor(fromTime / 1000)]);
          this.logInfo(`Found ${rows.length} history items in Firefox profile ${profile}`);

          for (const row of rows) {
            if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
              uniqueUrls.add(row.url);
              const historyItem = this.createHistoryItem(
                row.title,
                row.url,
                INITIAL_SCORE,
                row.visit_date ? (row.visit_date/1000000) * 1000 : null
              );
              allHistory.push(historyItem);
            }
          }
        } catch (error) {
          this.logError(`Failed to execute query for Firefox profile ${profile}:`, error);
          continue;
        }

        db.close();
        fs.unlinkSync(tempPath);
      } catch (error) {
        this.logError(`Error importing Firefox history for profile ${profile}:`, error);
      }
    }

    // Bulk save all imported history items to electron-store
    if (allHistory.length > 0) {
      try {
        this.electronStore.setArray("history", allHistory);
        this.logInfo(`Bulk saved ${allHistory.length} history items to electron-store`);
      } catch (error) {
        this.logError('Failed to bulk save history items to electron-store:', error);
      }
    }

    this.logInfo(`Successfully imported ${allHistory.length} items from Firefox history`);
    return allHistory;
  }
}

module.exports = FirefoxHistoryProvider;
