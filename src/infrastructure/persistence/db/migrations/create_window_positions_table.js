const db = require('../connection');

async function up() {
    const query = `
        CREATE TABLE IF NOT EXISTS window_positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await db.run(query);
}

async function down() {
    const query = `DROP TABLE IF EXISTS window_positions`;
    await db.run(query);
}

module.exports = { up, down };
