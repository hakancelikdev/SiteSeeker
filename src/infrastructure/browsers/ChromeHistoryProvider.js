const path = require('path');
const fs = require('fs');
const os = require('os');

const Database = require('better-sqlite3');
const { app } = require('electron');
const log = require('electron-log');

const { HistoryItem, INITIAL_SCORE } = require('../../domain/models/HistoryItem');

class ChromeHistoryProvider {
  constructor() {
    this.basePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
    log.info('ChromeHistoryProvider initialized with base path:', this.basePath);
  }

  async getProfiles() {
    try {
      if (!fs.existsSync(this.basePath)) {
        log.warn('Chrome base path does not exist:', this.basePath);
        return [];
      }

      const profiles = fs.readdirSync(this.basePath)
        .filter(item => {
          const itemPath = path.join(this.basePath, item);
          return fs.existsSync(itemPath) &&
                 fs.statSync(itemPath).isDirectory() &&
                 fs.existsSync(path.join(itemPath, 'History'));
        });

      log.info(`Found ${profiles.length} Chrome profiles`);
      return profiles;
    } catch (error) {
      log.error('Error getting Chrome profiles:', error);
      return [];
    }
  }

  async importHistory(uniqueUrls = new Set(), fromTime = 0) {
    const allHistory = [];
    const profiles = await this.getProfiles();

    if (profiles.length === 0) {
      log.warn('No Chrome profiles found to import history from');
      return allHistory;
    }

    for (const profile of profiles) {
      try {
        const historyPath = path.join(this.basePath, profile, 'History');
        const tempPath = path.join(app.getPath('temp'), `chrome_history_temp_${profile}`);

        log.info(`Importing Chrome history from profile: ${profile}`);

        // Check if history file exists and is accessible
        if (!fs.existsSync(historyPath)) {
          log.warn(`History file not found for profile ${profile}: ${historyPath}`);
          continue;
        }

        try {
          fs.copyFileSync(historyPath, tempPath);
        } catch (error) {
          log.error(`Failed to copy Chrome history file for profile ${profile}:`, error);
          continue;
        }

        let db;
        try {
          db = new Database(tempPath, { readonly: true });
        } catch (error) {
          log.error(`Failed to open Chrome history database for profile ${profile}:`, error);
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

        let rows;
        try {
          rows = fromTime === 0
            ? db.prepare(query).all()
            : db.prepare(query).all(Math.floor(fromTime / 1000));
        } catch (error) {
          log.error(`Failed to execute query for Chrome profile ${profile}:`, error);
          continue;
        }

        log.info(`Found ${rows.length} history items in Chrome profile ${profile}`);

        for (const row of rows) {
          if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
            uniqueUrls.add(row.url);
            const score = row.visit_count
              ? INITIAL_SCORE + row.visit_count + (row.typed_count || 0)
              : INITIAL_SCORE;
            allHistory.push(new HistoryItem(
              row.title.trim(),
              row.url,
              score,
              row.last_visit_time ? (row.last_visit_time/1000000 + (new Date('1601-01-01').getTime()/1000)) * 1000 : null
            ));
          }
        }

        db.close();
        fs.unlinkSync(tempPath);
      } catch (error) {
        log.error(`Error importing Chrome history for profile ${profile}:`, error);
      }
    }

    log.info(`Successfully imported ${allHistory.length} items from Chrome history`);
    return allHistory;
  }
}

module.exports = ChromeHistoryProvider;
