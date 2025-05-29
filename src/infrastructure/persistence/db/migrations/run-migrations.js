const { getDatabase } = require('../connection');

const createWindowPositionsTable = require('./create_window_positions_table');

async function runMigrations() {
    try {
        // Create migrations table if it doesn't exist
        await getDatabase.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Run window_positions table migration
        const migrationName = 'create_window_positions_table';
        const existingMigration = await getDatabase.query(
            'SELECT * FROM migrations WHERE name = ?',
            [migrationName]
        );

        if (!existingMigration.rows.length) {
            await createWindowPositionsTable.up();
            await getDatabase.run(
                'INSERT INTO migrations (name) VALUES (?)',
                [migrationName]
            );
        }
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

module.exports = { runMigrations };
