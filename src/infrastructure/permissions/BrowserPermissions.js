const fs = require('fs');
const path = require('path');
const os = require('os');
const log = require('electron-log');

class BrowserPermissions {
    static async checkChromePermissions() {
        const chromePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
        return this.checkPathPermissions(chromePath, 'Chrome');
    }

    static async checkFirefoxPermissions() {
        const firefoxPath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
        return this.checkPathPermissions(firefoxPath, 'Firefox');
    }

    static async checkPathPermissions(basePath, browserName) {
        try {
            // Check if base path exists
            if (!fs.existsSync(basePath)) {
                log.warn(`${browserName} base path does not exist: ${basePath}`);
                return false;
            }

            // Check read permissions
            try {
                fs.accessSync(basePath, fs.constants.R_OK);
            } catch (error) {
                log.error(`No read permission for ${browserName} base path: ${basePath}`);
                return false;
            }

            // Check if we can list directories
            try {
                fs.readdirSync(basePath);
            } catch (error) {
                log.error(`Cannot read ${browserName} directory: ${basePath}`);
                return false;
            }

            // For Firefox, check if we can access profiles
            if (browserName === 'Firefox') {
                const profiles = fs.readdirSync(basePath)
                    .filter(item => {
                        const itemPath = path.join(basePath, item);
                        return fs.existsSync(itemPath) && 
                               fs.statSync(itemPath).isDirectory() && 
                               fs.existsSync(path.join(itemPath, 'places.sqlite'));
                    });

                if (profiles.length === 0) {
                    log.warn(`No ${browserName} profiles found`);
                    return false;
                }

                // Check if we can access the history file
                const profilePath = path.join(basePath, profiles[0]);
                const historyPath = path.join(profilePath, 'places.sqlite');
                
                try {
                    fs.accessSync(historyPath, fs.constants.R_OK);
                } catch (error) {
                    log.error(`No read permission for ${browserName} history file: ${historyPath}`);
                    return false;
                }
            }

            // For Chrome, check if we can access profiles
            if (browserName === 'Chrome') {
                const profiles = fs.readdirSync(basePath)
                    .filter(item => {
                        const itemPath = path.join(basePath, item);
                        return fs.existsSync(itemPath) && 
                               fs.statSync(itemPath).isDirectory() && 
                               fs.existsSync(path.join(itemPath, 'History'));
                    });

                if (profiles.length === 0) {
                    log.warn(`No ${browserName} profiles found`);
                    return false;
                }

                // Check if we can access the history file
                const profilePath = path.join(basePath, profiles[0]);
                const historyPath = path.join(profilePath, 'History');
                
                try {
                    fs.accessSync(historyPath, fs.constants.R_OK);
                } catch (error) {
                    log.error(`No read permission for ${browserName} history file: ${historyPath}`);
                    return false;
                }
            }

            log.info(`${browserName} permissions check passed`);
            return true;
        } catch (error) {
            log.error(`Error checking ${browserName} permissions:`, error);
            return false;
        }
    }
}

module.exports = BrowserPermissions; 