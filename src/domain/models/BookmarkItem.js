class BookmarkItem {
    constructor(title, url, folder = null, lastModified = null) {
        this.title = title;
        this.url = url;
        this.folder = folder;
        this.lastModified = lastModified;
        this.isBookmark = true; // Flag to identify bookmark items
    }
}

module.exports = BookmarkItem;
