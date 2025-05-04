const path = require('path');

const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');

class WindowPositionRepository {
    constructor() {
        this.dbPath = path.join(app.getPath('userData'), 'window-positions.db');
        this.db = null;
        this.initialize();
    }

    async initialize() {
        try {
            this.db = new sqlite3.Database(this.dbPath);
            await this.createTable();
            log.info('Window position database initialized successfully');
        } catch (error) {
            log.error('Failed to initialize window position database:', error);
            throw error;
        }
    }

    createTable() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS window_positions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        x INTEGER NOT NULL,
                        y INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async savePosition(x, y) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(
                    'INSERT INTO window_positions (x, y) VALUES (?, ?)',
                    [x, y],
                    (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        });
    }

    async getLatestPosition() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.get(
                    'SELECT x, y FROM window_positions ORDER BY created_at DESC LIMIT 1',
                    (error, row) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(row ? { x: row.x, y: row.y } : null);
                        }
                    }
                );
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = WindowPositionRepository;
