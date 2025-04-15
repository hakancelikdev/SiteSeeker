document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');

    // Function to update the connection status UI
    function updateConnectionStatus(isConnected) {
        if (isConnected) {
            statusIndicator.classList.add('connected');
            statusIndicator.classList.remove('disconnected');
            statusText.textContent = 'Connected to Fast History Search';
        } else {
            statusIndicator.classList.add('disconnected');
            statusIndicator.classList.remove('connected');
            statusText.textContent = 'Not connected - Please start the application';
        }
    }

    // Check connection status
    chrome.runtime.sendMessage({ type: 'checkConnection' }, function(response) {
        if (chrome.runtime.lastError) {
            updateConnectionStatus(false);
            return;
        }
        updateConnectionStatus(response && response.isConnected);
    });

    // Listen for connection status updates
    chrome.runtime.onMessage.addListener(function(message) {
        if (message.type === 'connectionStatus') {
            updateConnectionStatus(message.isConnected);
        }
    });
}); 