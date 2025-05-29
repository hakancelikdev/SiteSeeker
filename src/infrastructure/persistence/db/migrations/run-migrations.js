const db = require('../connection');

const createWindowPositionsTable = require('./create_window_positions_table');

async function runMigrations() {
    try {
        // Create migrations table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Run window_positions table migration
        const migrationName = 'create_window_positions_table';
        const existingMigration = await db.query(
            'SELECT * FROM migrations WHERE name = ?',
            [migrationName]
        );

        if (!existingMigration.rows.length) {
            await createWindowPositionsTable.up();
            await db.run(
                'INSERT INTO migrations (name) VALUES (?)',
                [migrationName]
            );
            console.log('Migration completed:', migrationName);
        }
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

module.exports = { runMigrations };
