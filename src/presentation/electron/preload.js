const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            const validChannels = [
                'toMain',
                'importHistory',
                'resetHistory',
                'search',
                'get-url-count',
                'open-url'
            ];
            if (validChannels.includes(channel)) {
                console.log('Sending IPC message:', channel, data);
                ipcRenderer.send(channel, data);
            } else {
                console.error('Invalid channel:', channel);
            }
        },
        receive: (channel, func) => {
            const validChannels = [
                'fromMain',
                'importHistoryResponse',
                'resetHistoryResponse',
                'history-updated',
                'search-results',
                'error',
                'bookmark-import-complete'
            ];
            if (validChannels.includes(channel)) {
                console.log('Registering IPC listener for channel:', channel);
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => {
                    console.log('Received IPC message:', channel, args);
                    func(...args);
                });
            } else {
                console.error('Invalid channel:', channel);
            }
        }
    }
);

// Log that preload script has loaded
console.log('Preload script loaded successfully');
