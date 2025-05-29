const path = require('path');
const fs = require('fs');
const os = require('os');

const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');
const log = require('electron-log');

const BaseBookmarkProvider = require('../BaseBookmarkProvider');
const BookmarkItem = require('../../../../domain/models/BookmarkItem');

class FirefoxBookmarkProvider extends BaseBookmarkProvider {
    constructor() {
        const basePath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
        super('Firefox', basePath);
    }

    filterProfiles(items) {
        return items.filter(item => {
            const itemPath = path.join(this.basePath, item);
            return fs.existsSync(itemPath) &&
                fs.statSync(itemPath).isDirectory() &&
                fs.existsSync(path.join(itemPath, 'places.sqlite'));
        });
    }

    async importBookmarksFromProfile(profile, uniqueUrls) {
        const bookmarks = [];
        const placesPath = path.join(this.basePath, profile, 'places.sqlite');
        const tempPath = path.join(app.getPath('temp'), `firefox_bookmarks_temp_${profile}`);

        log.info(`Importing Firefox bookmarks from profile: ${profile}`);

        // Check if places file exists and is accessible
        if (!fs.existsSync(placesPath)) {
            log.warn(`Places file not found for profile ${profile}: ${placesPath}`);
            return bookmarks;
        }

        try {
            fs.copyFileSync(placesPath, tempPath);
        } catch (error) {
            log.error(`Failed to copy Firefox places file for profile ${profile}:`, error);
            return bookmarks;
        }

        let db;
        try {
            db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        } catch (error) {
            log.error(`Failed to open Firefox places database for profile ${profile}:`, error);
            return bookmarks;
        }

        const query = `SELECT moz_bookmarks.title, moz_places.url, moz_bookmarks.dateAdded, moz_bookmarks.parent as folder_id
                     FROM moz_bookmarks
                     JOIN moz_places ON moz_bookmarks.fk = moz_places.id
                     WHERE moz_bookmarks.type = 1
                     AND moz_bookmarks.title IS NOT NULL
                     AND moz_bookmarks.title != ''
                     ORDER BY moz_bookmarks.dateAdded DESC`;

        try {
            await new Promise((resolve, reject) => {
                db.all(query, [], (error, rows) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    log.info(`Found ${rows.length} bookmarks in Firefox profile ${profile}`);

                    for (const row of rows) {
                        if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
                            uniqueUrls.add(row.url);
                            bookmarks.push(new BookmarkItem(
                                row.title.trim(),
                                row.url,
                                '', // Firefox'ta folder bilgisi farklı şekilde tutuluyor, şimdilik boş bırakıyoruz
                                row.dateAdded ? (row.dateAdded/1000000) * 1000 : null
                            ));
                        }
                    }
                    resolve();
                });
            });
        } catch (error) {
            log.error(`Failed to execute query for Firefox profile ${profile}:`, error);
        } finally {
            db.close();
            try {
                fs.unlinkSync(tempPath);
            } catch (error) {
                log.warn(`Failed to delete temporary file ${tempPath}:`, error);
            }
        }

        return bookmarks;
    }
}

module.exports = FirefoxBookmarkProvider;
