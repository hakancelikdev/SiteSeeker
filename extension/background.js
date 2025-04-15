let port = null;
let isConnected = false;
let connectionCheckInterval = null;

// Connect to native messaging host
function connectToNativeHost() {
    port = chrome.runtime.connectNative('dev.hakancelik.fasthistorysearch');
    
    port.onMessage.addListener((message) => {
        console.log('Received message from native host:', message);
    });

    port.onDisconnect.addListener(() => {
        console.error('Disconnected from native host:', chrome.runtime.lastError);
        port = null;
        // Try to reconnect after a delay
        setTimeout(connectToNativeHost, 5000);
    });
}

// Initial connection attempt
connectToNativeHost();

// Listen for history updates
chrome.history.onVisited.addListener((historyItem) => {
    if (port) {
        port.postMessage({
            type: 'history_update',
            data: {
                url: historyItem.url,
                title: historyItem.title,
                lastVisitTime: historyItem.lastVisitTime,
                visitCount: historyItem.visitCount
            }
        });
    }
});

// Handle messages from the extension popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'get_connection_status') {
        sendResponse({ connected: port !== null });
    }
});

// URL silinmelerini dinle
chrome.history.onVisitRemoved.addListener((removed) => {
  if (port) {
    port.postMessage({
      type: 'remove',
      data: removed
    });
  }
});

// Function to check connection status
async function checkConnection() {
  try {
    const response = await fetch('http://localhost:3000/ping', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const newConnectionStatus = response.ok;

    // If connection status has changed, notify all extension pages
    if (newConnectionStatus !== isConnected) {
      isConnected = newConnectionStatus;
      const message = {
        type: 'connectionStatus',
        isConnected: isConnected
      };

      // Send message to all extension pages
      chrome.runtime.sendMessage(message).catch(() => {
        // Ignore errors from sending messages to non-existent pages
      });
    }

    return isConnected;
  } catch (error) {
    if (isConnected) {
      isConnected = false;
      const message = {
        type: 'connectionStatus',
        isConnected: false
      };

      // Send message to all extension pages
      chrome.runtime.sendMessage(message).catch(() => {
        // Ignore errors from sending messages to non-existent pages
      });
    }
    return false;
  }
}

// Start periodic connection checking
function startConnectionCheck() {
  if (!connectionCheckInterval) {
    // Initial check
    checkConnection();
    // Set up periodic checking every 5 seconds
    connectionCheckInterval = setInterval(checkConnection, 5000);
  }
}

// Stop connection checking
function stopConnectionCheck() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'checkConnection') {
    // Return current connection status immediately
    sendResponse({ isConnected });
    
    // Also perform a fresh check
    checkConnection().then(status => {
      if (status !== isConnected) {
        chrome.runtime.sendMessage({
          type: 'connectionStatus',
          isConnected: status
        }).catch(() => {
          // Ignore errors from sending messages to non-existent pages
        });
      }
    });
    
    // Return true to indicate we'll send an async response
    return true;
  }
});

// Start connection checking when extension loads
startConnectionCheck();

// Clean up when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopConnectionCheck();
}); 