const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');
const { app } = require('electron');
const BookmarkItem = require('../../domain/models/BookmarkItem');
const log = require('electron-log');

class FirefoxBookmarkProvider {
    constructor() {
        this.basePath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
        log.info('FirefoxBookmarkProvider initialized with base path:', this.basePath);
    }

    async getProfiles() {
        try {
            const profiles = [];
            const items = fs.readdirSync(this.basePath);
            
            for (const item of items) {
                const itemPath = path.join(this.basePath, item);
                if (fs.statSync(itemPath).isDirectory() && item.endsWith('.default-release')) {
                    profiles.push(item);
                }
            }
            
            return profiles;
        } catch (error) {
            log.error('Error getting Firefox profiles:', error);
            return [];
        }
    }

    async importBookmarks(uniqueUrls = new Set()) {
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

                if (!fs.existsSync(placesPath)) {
                    log.warn(`Places file not found for profile ${profile}: ${placesPath}`);
                    continue;
                }

                fs.copyFileSync(placesPath, tempPath);
                const db = new Database(tempPath, { readonly: true });

                const query = `
                    SELECT b.title, p.url, b.dateAdded, b.lastModified, 
                           GROUP_CONCAT(f.title, '/') as folder_path
                    FROM moz_bookmarks b
                    JOIN moz_places p ON b.fk = p.id
                    LEFT JOIN moz_bookmarks f ON b.parent = f.id
                    WHERE b.type = 1
                    GROUP BY b.id
                `;

                const rows = db.prepare(query).all();

                for (const row of rows) {
                    if (!uniqueUrls.has(row.url) && row.title && row.title.trim()) {
                        uniqueUrls.add(row.url);
                        allBookmarks.push(new BookmarkItem(
                            row.title.trim(),
                            row.url,
                            row.folder_path || null,
                            row.lastModified ? row.lastModified/1000000 : null
                        ));
                    }
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