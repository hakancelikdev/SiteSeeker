const path = require('path');

const { app } = require('electron');

// Uygulama veri dizinini al
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'siteseeker.db');

const config = {
    development: {
        database: dbPath,
        verbose: console.log
    },
    production: {
        database: dbPath,
        verbose: null
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
