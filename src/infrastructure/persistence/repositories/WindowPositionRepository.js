const BaseRepository = require('../db/base-repository');

class WindowPositionRepository extends BaseRepository {
    constructor() {
        super('window_positions');
    }

    async savePosition(x, y) {
        const data = {
            x: x,
            y: y
        };
        return await this.create(data);
    }

    async getLatestPosition() {
        const query = 'SELECT x, y FROM window_positions ORDER BY created_at DESC LIMIT 1';
        const result = await this.executeQuery(query);
        return result[0] ? { x: result[0].x, y: result[0].y } : null;
    }
}

module.exports = WindowPositionRepository;
