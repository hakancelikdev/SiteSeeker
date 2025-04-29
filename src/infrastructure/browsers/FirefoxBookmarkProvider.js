const path = require('path');
const fs = require('fs');
const os = require('os');

const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');
const log = require('electron-log');

const { HistoryItem, INITIAL_SCORE } = require('../../domain/models/HistoryItem');

class FirefoxBookmarkProvider {
    constructor() {
        this.basePath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
        log.info('FirefoxBookmarkProvider initialized with base path:', this.basePath);
    }

    async getProfiles() {
        try {
            const profiles = fs.readdirSync(this.basePath)
                .filter(item => {
                    const itemPath = path.join(this.basePath, item);
                    return fs.existsSync(itemPath) &&
                        fs.statSync(itemPath).isDirectory() &&
                        fs.existsSync(path.join(itemPath, 'places.sqlite'));
                });
            return profiles;
        } catch (error) {
            log.error('Error getting Firefox profiles:', error);
            return [];
        }
    }

    async importBookmarks(uniqueUrls = new Set(), fromTime = 0) {
        const allBookmarks = [];
        const profiles = await this.getProfiles();

        if (profiles.length === 0) {
            log.warn('No Firefox profiles found to import bookmarks from');
            return allBookmarks;
        }

        for (const profile of profiles) {
            try {
                const placesPath = path.join(this.basePath, profile, 'places.sqlite');
                const tempPath = path.join(app.getPath('temp'), `firefox_bookmarks_temp_${profile}`);

                log.info(`Importing Firefox bookmarks from profile: ${profile}`);

                // Check if places file exists and is accessible
                if (!fs.existsSync(placesPath)) {
                    log.warn(`Places file not found for profile ${profile}: ${placesPath}`);
                    continue;
                }

                try {
                    fs.copyFileSync(placesPath, tempPath);
                } catch (error) {
                    log.error(`Failed to copy Firefox places file for profile ${profile}:`, error);
                    continue;
                }

                let db;
                try {
                    db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
                } catch (error) {
                    log.error(`Failed to open Firefox places database for profile ${profile}:`, error);
                    continue;
                }

                const query = fromTime === 0
                    ? `SELECT moz_bookmarks.title, moz_places.url, moz_bookmarks.dateAdded
                       FROM moz_bookmarks
                       JOIN moz_places ON moz_bookmarks.fk = moz_places.id
                       WHERE moz_bookmarks.type = 1
                       AND moz_bookmarks.title IS NOT NULL
                       AND moz_bookmarks.title != ''
                       ORDER BY moz_bookmarks.dateAdded DESC`
                    : `SELECT moz_bookmarks.title, moz_places.url, moz_bookmarks.dateAdded
                       FROM moz_bookmarks
                       JOIN moz_places ON moz_bookmarks.fk = moz_places.id
                       WHERE moz_bookmarks.type = 1
                       AND moz_bookmarks.title IS NOT NULL
                       AND moz_bookmarks.title != ''
                       AND moz_bookmarks.dateAdded/1000000 > ?
                       ORDER BY moz_bookmarks.dateAdded DESC`;

                try {
                    await new Promise((resolve, reject) => {
                        db.all(query, fromTime === 0 ? [] : [Math.floor(fromTime / 1000)], (error, rows) => {
                            if (error) {
                                reject(error);
                                return;
                            }

                            log.info(`Found ${rows.length} bookmarks in Firefox profile ${profile}`);

                            for (const row of rows) {
                                if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
                                    uniqueUrls.add(row.url);
                                    allBookmarks.push(new HistoryItem(
                                        row.title.trim(),
                                        row.url,
                                        INITIAL_SCORE,
                                        row.dateAdded ? (row.dateAdded/1000000) * 1000 : null
                                    ));
                                }
                            }
                            resolve();
                        });
                    });
                } catch (error) {
                    log.error(`Failed to execute query for Firefox profile ${profile}:`, error);
                    continue;
                }

                db.close();
                fs.unlinkSync(tempPath);
            } catch (error) {
                log.error(`Error importing Firefox bookmarks for profile ${profile}:`, error);
            }
        }

        log.info(`Successfully imported ${allBookmarks.length} items from Firefox bookmarks`);
        return allBookmarks;
    }
}

module.exports = FirefoxBookmarkProvider;
