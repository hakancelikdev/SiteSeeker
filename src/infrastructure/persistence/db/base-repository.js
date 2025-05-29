const db = require('./connection');

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = `SELECT * FROM ${this.tableName}`;
        const result = await db.query(query);
        return result.rows;
    }

    async create(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `
            INSERT INTO ${this.tableName} (${columns})
            VALUES (${placeholders})
        `;

        const result = await db.run(query, values);
        if (result.lastID) {
            return this.findById(result.lastID);
        }
        return null;
    }

    async update(id, data) {
        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');

        const values = [...Object.values(data), id];
        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE id = ?
        `;

        await db.run(query, values);
        return this.findById(id);
    }

    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await db.run(query, [id]);
        return result.changes > 0;
    }

    async executeQuery(query, params = []) {
        const result = await db.query(query, params);
        return result.rows;
    }

    async executeTransaction(callback) {
        return await db.transaction(callback);
    }
}

module.exports = BaseRepository;
