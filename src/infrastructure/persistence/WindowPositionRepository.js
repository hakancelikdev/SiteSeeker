const path = require('path');

const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');

class WindowPositionRepository {
    constructor() {
        this.dbPath = path.join(app.getPath('userData'), 'window-positions.db');
        this.db = null;
        this.isClosed = false;
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
        if (this.db && !this.isClosed) {
            try {
                // Tüm bekleyen işlemlerin tamamlanmasını bekle
                this.db.serialize(() => {
                    this.db.close((err) => {
                        if (err) {
                            log.error('Error closing database:', err);
                        } else {
                            this.isClosed = true;
                            log.info('Database connection closed successfully');
                        }
                    });
                });
            } catch (error) {
                log.error('Error during database closure:', error);
            }
        } else if (this.isClosed) {
            log.debug('Database already closed, skipping close operation');
        }
    }
}

module.exports = WindowPositionRepository;
