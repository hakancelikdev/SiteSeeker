const path = require('path');
const fs = require('fs');
const os = require('os');

const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');

const BaseHistoryProvider = require('../BaseHistoryProvider');
const { INITIAL_SCORE } = require('../../../../domain/models/HistoryItem');

class ChromeHistoryProvider extends BaseHistoryProvider {
  constructor() {
    super();
    this.basePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
    this.logInfo('ChromeHistoryProvider initialized with base path: ' + this.basePath);
  }

  async getProfiles() {
    try {
      if (!fs.existsSync(this.basePath)) {
        this.logWarn('Chrome base path does not exist: ' + this.basePath);
        return [];
      }

      const profiles = fs.readdirSync(this.basePath)
        .filter(item => {
          const itemPath = path.join(this.basePath, item);
          return fs.existsSync(itemPath) &&
                 fs.statSync(itemPath).isDirectory() &&
                 fs.existsSync(path.join(itemPath, 'History'));
        });

      this.logInfo(`Found ${profiles.length} Chrome profiles`);
      return profiles;
    } catch (error) {
      this.logError('Error getting Chrome profiles:', error);
      return [];
    }
  }

  async importHistory(uniqueUrls = new Set(), fromTime = 0) {
    const allHistory = [];
    const profiles = await this.getProfiles();

    if (profiles.length === 0) {
      this.logWarn('No Chrome profiles found to import history from');
      return allHistory;
    }

    for (const profile of profiles) {
      try {
        const historyPath = path.join(this.basePath, profile, 'History');
        const tempPath = path.join(app.getPath('temp'), `chrome_history_temp_${profile}`);

        this.logInfo(`Importing Chrome history from profile: ${profile}`);

        if (!fs.existsSync(historyPath)) {
          this.logWarn(`History file not found for profile ${profile}: ${historyPath}`);
          continue;
        }

        try {
          fs.copyFileSync(historyPath, tempPath);
        } catch (error) {
          this.logError(`Failed to copy Chrome history file for profile ${profile}:`, error);
          continue;
        }

        let db;
        try {
          db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        } catch (error) {
          this.logError(`Failed to open Chrome history database for profile ${profile}:`, error);
          continue;
        }

        const query = fromTime === 0
          ? `SELECT title, url, last_visit_time, visit_count, typed_count FROM urls
             WHERE title IS NOT NULL AND title != ''
             ORDER BY last_visit_time DESC`
          : `SELECT url, title, visit_count, typed_count FROM urls
             WHERE title IS NOT NULL AND title != ''
             AND last_visit_time/1000000 + (strftime('%s', '1601-01-01')) > ?
             ORDER BY last_visit_time DESC`;

        try {
          await new Promise((resolve, reject) => {
            db.all(query, fromTime === 0 ? [] : [Math.floor(fromTime / 1000)], (error, rows) => {
              if (error) {
                reject(error);
                return;
              }

              this.logInfo(`Found ${rows.length} history items in Chrome profile ${profile}`);

              for (const row of rows) {
                if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
                  uniqueUrls.add(row.url);
                  const score = row.visit_count
                    ? INITIAL_SCORE + row.visit_count + (row.typed_count || 0)
                    : INITIAL_SCORE;
                  allHistory.push(this.createHistoryItem(
                    row.title,
                    row.url,
                    score,
                    row.last_visit_time ? (row.last_visit_time/1000000 + (new Date('1601-01-01').getTime()/1000)) * 1000 : null
                  ));
                }
              }
              resolve();
            });
          });
        } catch (error) {
          this.logError(`Failed to execute query for Chrome profile ${profile}:`, error);
          continue;
        }

        db.close();
        fs.unlinkSync(tempPath);
      } catch (error) {
        this.logError(`Error importing Chrome history for profile ${profile}:`, error);
      }
    }

    this.logInfo(`Successfully imported ${allHistory.length} items from Chrome history`);
    return allHistory;
  }
}

module.exports = ChromeHistoryProvider;
