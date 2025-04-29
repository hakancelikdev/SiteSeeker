const path = require('path');
const fs = require('fs');
const os = require('os');

const log = require('electron-log');

const BookmarkItem = require('../../domain/models/BookmarkItem');

class ChromeBookmarkProvider {
    constructor() {
        this.basePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
        log.info('ChromeBookmarkProvider initialized with base path:', this.basePath);
    }

    async getProfiles() {
        try {
            // Check if Chrome directory exists
            if (!fs.existsSync(this.basePath)) {
                log.warn('Chrome directory not found:', this.basePath);
                return [];
            }

            // Get all items in the Chrome directory
            const items = fs.readdirSync(this.basePath);
            const profiles = [];

            // Known non-profile files to ignore
            const ignoreFiles = new Set([
                'RunningChromeVersion',
                'SingletonCookie',
                'SingletonLock',
                'Local State',
                'Last Version',
                'Last Browser',
                'First Run'
            ]);

            // Look for profile directories
            for (const item of items) {
                // Skip known non-profile files
                if (ignoreFiles.has(item)) {
                    continue;
                }

                const itemPath = path.join(this.basePath, item);
                try {
                    // Only process directories
                    if (!fs.statSync(itemPath).isDirectory()) {
                        continue;
                    }

                    // Check if it's a profile directory
                    if (item === 'Default' || item.startsWith('Profile')) {
                        // Verify this is a valid profile by checking for Bookmarks file
                        const bookmarkPath = path.join(itemPath, 'Bookmarks');
                        if (fs.existsSync(bookmarkPath)) {
                            profiles.push(item);
                        }
                    }
                } catch (err) {
                    log.warn(`Error checking item ${item}:`, err);
                    continue;
                }
            }

            log.info(`Found ${profiles.length} Chrome profiles:`, profiles);
            return profiles;
        } catch (error) {
            log.error('Error getting Chrome profiles:', error);
            return [];
        }
    }

    async importBookmarks(uniqueUrls = new Set()) {
        const allBookmarks = [];
        const profiles = await this.getProfiles();

        if (profiles.length === 0) {
            log.warn('No Chrome profiles found to import bookmarks from');
            return allBookmarks;
        }

        for (const profile of profiles) {
            try {
                const bookmarkPath = path.join(this.basePath, profile, 'Bookmarks');

                if (!fs.existsSync(bookmarkPath)) {
                    log.warn(`Bookmarks file not found for profile ${profile}: ${bookmarkPath}`);
                    continue;
                }

                const bookmarksData = JSON.parse(fs.readFileSync(bookmarkPath, 'utf8'));
                log.info(`Processing bookmarks for profile ${profile}`);

                // Process each root folder (bookmark_bar, other, synced)
                for (const [rootName, rootNode] of Object.entries(bookmarksData.roots)) {
                    const bookmarks = this.extractBookmarks(rootNode, rootName);
                    log.info(`Found ${bookmarks.length} bookmarks in ${rootName}`);

                    for (const bookmark of bookmarks) {
                        if (!uniqueUrls.has(bookmark.url) && bookmark.title && bookmark.title.trim()) {
                            uniqueUrls.add(bookmark.url);
                            allBookmarks.push(new BookmarkItem(
                                bookmark.title.trim(),
                                bookmark.url,
                                bookmark.folder,
                                bookmark.date_added
                            ));
                        }
                    }
                }
            } catch (error) {
                log.error(`Error importing Chrome bookmarks for profile ${profile}:`, error);
            }
        }

        log.info(`Successfully imported ${allBookmarks.length} items from Chrome bookmarks`);
        return allBookmarks;
    }

    extractBookmarks(node, folder = '') {
        let bookmarks = [];

        if (!node) {
            return bookmarks;
        }

        // If this is a bookmark
        if (node.type === 'url') {
            bookmarks.push({
                title: node.name,
                url: node.url,
                folder: folder,
                date_added: node.date_added
            });
        }
        // If this is a folder
        else if (node.type === 'folder' || node.children) {
            const newFolder = folder ? `${folder}/${node.name}` : node.name;
            const children = node.children || [];

            for (const child of children) {
                bookmarks = bookmarks.concat(this.extractBookmarks(child, newFolder));
            }
        }

        return bookmarks;
    }
}

module.exports = ChromeBookmarkProvider;
