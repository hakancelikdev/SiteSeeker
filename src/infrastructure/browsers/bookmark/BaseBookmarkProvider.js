const fs = require('fs');

const log = require('electron-log');

class BaseBookmarkProvider {
    constructor(browserName, basePath) {
        this.browserName = browserName;
        this.basePath = basePath;
        log.info(`${browserName}BookmarkProvider initialized with base path:`, this.basePath);
    }

    async getProfiles() {
        try {
            if (!fs.existsSync(this.basePath)) {
                log.warn(`${this.browserName} directory not found:`, this.basePath);
                return [];
            }

            const items = fs.readdirSync(this.basePath);
            return this.filterProfiles(items);
        } catch (error) {
            log.error(`Error getting ${this.browserName} profiles:`, error);
            return [];
        }
    }

    filterProfiles(items) {  // eslint-disable-line
        throw new Error('filterProfiles method must be implemented by child class');
    }

    async importBookmarks(uniqueUrls = new Set()) {
        const allBookmarks = [];
        const profiles = await this.getProfiles();

        if (profiles.length === 0) {
            log.warn(`No ${this.browserName} profiles found to import bookmarks from`);
            return allBookmarks;
        }

        for (const profile of profiles) {
            try {
                const bookmarks = await this.importBookmarksFromProfile(profile, uniqueUrls);
                allBookmarks.push(...bookmarks);
            } catch (error) {
                log.error(`Error importing ${this.browserName} bookmarks for profile ${profile}:`, error);
            }
        }

        log.info(`Successfully imported ${allBookmarks.length} items from ${this.browserName} bookmarks`);
        return allBookmarks;
    }

    importBookmarksFromProfile(profile, uniqueUrls) {  // eslint-disable-line
        throw new Error('importBookmarksFromProfile method must be implemented by child class');
    }
}

module.exports = BaseBookmarkProvider;
