const path = require('path');
const fs = require('fs');
const os = require('os');

const Database = require('better-sqlite3');
const { app } = require('electron');
const log = require('electron-log');

const { HistoryItem, INITIAL_SCORE } = require('../../domain/models/HistoryItem');

class FirefoxHistoryProvider {
  constructor() {
    this.basePath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
    log.info('FirefoxHistoryProvider initialized with base path:', this.basePath);
  }

  async getProfiles() {
    try {
      if (!fs.existsSync(this.basePath)) {
        log.warn('Firefox base path does not exist:', this.basePath);
        return [];
      }

      const profiles = fs.readdirSync(this.basePath)
        .filter(item => {
          const itemPath = path.join(this.basePath, item);
          return fs.existsSync(itemPath) &&
                 fs.statSync(itemPath).isDirectory() &&
                 fs.existsSync(path.join(itemPath, 'places.sqlite'));
        });

      log.info(`Found ${profiles.length} Firefox profiles`);
      return profiles;
    } catch (error) {
      log.error('Error getting Firefox profiles:', error);
      return [];
    }
  }

  async importHistory(uniqueUrls = new Set(), fromTime = 0) {
    const allHistory = [];
    const profiles = await this.getProfiles();

    if (profiles.length === 0) {
      log.warn('No Firefox profiles found to import history from');
      return allHistory;
    }

    for (const profile of profiles) {
      try {
        const historyPath = path.join(this.basePath, profile, 'places.sqlite');
        const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);

        log.info(`Importing Firefox history from profile: ${profile}`);

        // Check if history file exists and is accessible
        if (!fs.existsSync(historyPath)) {
          log.warn(`History file not found for profile ${profile}: ${historyPath}`);
          continue;
        }

        try {
          fs.copyFileSync(historyPath, tempPath);
        } catch (error) {
          log.error(`Failed to copy Firefox history file for profile ${profile}:`, error);
          continue;
        }

        let db;
        try {
          db = new Database(tempPath, { readonly: true });
        } catch (error) {
          log.error(`Failed to open Firefox history database for profile ${profile}:`, error);
          continue;
        }

        const query = fromTime === 0
          ? `SELECT p.title, p.url, p.visit_count, p.typed, p.last_visit_date
             FROM moz_places p
             WHERE p.title IS NOT NULL AND p.title != ''
             ORDER BY p.last_visit_date DESC`
          : `SELECT p.title, p.url, p.visit_count, p.typed, p.last_visit_date
             FROM moz_places p
             WHERE p.title IS NOT NULL AND p.title != ''
             AND p.last_visit_date/1000000 > ?
             ORDER BY p.last_visit_date DESC`;

        let rows;
        try {
          rows = fromTime === 0
            ? db.prepare(query).all()
            : db.prepare(query).all(Math.floor(fromTime / 1000));
        } catch (error) {
          log.error(`Failed to execute query for Firefox profile ${profile}:`, error);
          continue;
        }

        log.info(`Found ${rows.length} history items in Firefox profile ${profile}`);

        for (const row of rows) {
          if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
            uniqueUrls.add(row.url);
            const score = row.visit_count
              ? INITIAL_SCORE + row.visit_count + (row.typed || 0)
              : INITIAL_SCORE;
            allHistory.push(new HistoryItem(
              row.title.trim(),
              row.url,
              score,
              row.last_visit_date ? row.last_visit_date/1000 : null
            ));
          }
        }

        db.close();
        fs.unlinkSync(tempPath);
      } catch (error) {
        log.error(`Error importing Firefox history for profile ${profile}:`, error);
      }
    }

    log.info(`Successfully imported ${allHistory.length} items from Firefox history`);
    return allHistory;
  }
}

module.exports = FirefoxHistoryProvider;
