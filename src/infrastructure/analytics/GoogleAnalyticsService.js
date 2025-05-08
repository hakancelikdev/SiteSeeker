const fs = require('fs');
const os = require('os');

require('dotenv').config();
const axios = require('axios');

class GoogleAnalyticsService {
    constructor() {
        this.measurementId = process.env.GA_MEASUREMENT_ID;
        this.apiSecret = process.env.GA_API_SECRET;
        this.clientId = this.generateClientId();
        this.endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
        this.isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
    }

    generateClientId() {
        const homeDir = os.homedir();
        const clientIdPath = `${homeDir}/.siteseeker_client_id`;
        try {
            if (fs.existsSync(clientIdPath)) {
                const id = fs.readFileSync(clientIdPath, 'utf8').trim();
                if (id) return id;
            }
            const newId = Math.random().toString(36).substring(2) + Date.now();
            fs.writeFileSync(clientIdPath, newId, { encoding: 'utf8', mode: 0o600 });
            return newId;
        } catch (err) {
            // Eğer dosya yazılamazsa, fallback olarak random üret
            return Math.random().toString(36).substring(2) + Date.now();
        }
    }

    async sendEvent(name, params = {}) {
        if (this.isDebug) {
            console.log(`[GA-MP] Debug modda, event gönderilmiyor: ${name}`, params);
            return;
        }
        const payload = {
            client_id: this.clientId,
            events: [
                {
                    name,
                    params
                }
            ]
        };
        try {
            console.log('[GA-MP] Sending event:', name, payload);
            const res = await axios.post(this.endpoint, payload);
            console.log('[GA-MP] Event sent:', res.status);
        } catch (err) {
            console.error('[GA-MP] Error sending event:', err.response ? err.response.data : err.message);
        }
    }

    trackAppStart() {
        this.sendEvent('app_start', {
            app_version: process.env.npm_package_version
        });
    }

    trackSessionDuration(duration) {
        this.sendEvent('session_duration', {
            duration
        });
    }

    trackError(errorType, errorMessage) {
        this.sendEvent('error', {
            error_type: errorType,
            error_message: errorMessage
        });
    }

    // Yeni eventler:
    trackImportClicked() {
        this.sendEvent('import_clicked');
    }

    trackResetClicked() {
        this.sendEvent('reset_clicked');
    }

    trackSearchPerformed(searchTerm) {
        this.sendEvent('search_performed', { search_term: searchTerm });
    }

    trackSearchResultClicked(url, searchTerm) {
        this.sendEvent('search_result_clicked', { url, search_term: searchTerm });
    }

    trackShortcutUsed() {
        this.sendEvent('shortcut_used');
    }

    trackCommandLinkOpened(url) {
        this.sendEvent('command_link_opened', { url });
    }

    trackAppVisible() {
        this.sendEvent('app_visible');
    }
}

module.exports = GoogleAnalyticsService;
