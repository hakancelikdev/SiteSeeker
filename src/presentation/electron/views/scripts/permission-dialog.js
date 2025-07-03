// DOM Elements
const pathList = document.getElementById('pathList');
const permissionGrant = document.getElementById('permissionGrant');
const permissionSkip = document.getElementById('permissionSkip');

// State
let hasShownPermissionDialog = false;

// Check if window.api exists
if (!window.api) {
    console.error('window.api is not available. Preload script might not be working correctly.');
}

// IPC Event Listeners
if (window.api) {
    console.log('Setting up IPC event listeners for permission dialog...');

    // Listen for browser data paths
    window.api.receive('browser-data-paths', (paths) => {
        console.log('Received browser data paths:', paths);
        console.log('Path list element:', pathList);
        displayBrowserPaths(paths);
    });

    // Listen for browser data access result
    window.api.receive('browser-data-access-result', (data) => {
        console.log('Received browser data access result:', data);
        if (data.success) {
            // Close the permission dialog and show main window
            window.api.send('permission-dialog-completed', { granted: true });
        } else {
            // Show error and allow retry
            showError('Browser data access failed: ' + data.error);
        }
    });

    // Listen for theme changes from main process
    window.api.receive('theme-changed', (data) => {
        applyTheme(data.isDarkMode);
    });
}

// Theme Management
function applyTheme(isDarkMode) {
    console.log('Applying theme to permission dialog:', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}

// Permission Dialog Functions
function handlePermissionGrant() {
    console.log('Permission granted - starting import');
    
    if (window.api) {
        window.api.send('grant-browser-data-access');
    } else {
        console.error('Cannot grant browser data access: window.api is not available');
        showError('Browser data access is not available');
    }
}

function handlePermissionSkip() {
    console.log('Permission skipped');
    
    if (window.api) {
        window.api.send('permission-dialog-completed', { granted: false });
    } else {
        console.error('Cannot complete permission dialog: window.api is not available');
        showError('Cannot complete permission dialog');
    }
}

function populateBrowserPaths() {
    console.log('Populating browser paths...');
    console.log('window.api available:', !!window.api);
    if (window.api) {
        console.log('Sending get-browser-data-paths request...');
        window.api.send('get-browser-data-paths');
    } else {
        console.error('Cannot populate browser paths: window.api is not available');
    }
}

function displayBrowserPaths(paths) {
    console.log('Displaying browser paths:', paths);
    console.log('Path list element:', pathList);
    
    if (!pathList) {
        console.error('Path list element not found!');
        return;
    }
    
    pathList.innerHTML = '';
    
    if (!paths || paths.length === 0) {
        console.log('No browser paths found, showing no paths message');
        const noPathsItem = document.createElement('div');
        noPathsItem.className = 'path-item';
        noPathsItem.innerHTML = '<i class="fas fa-info-circle"></i><span class="path-text">No browser data found on your system</span>';
        pathList.appendChild(noPathsItem);
        return;
    }
    
    console.log('Adding browser paths to list:', paths.length);
    paths.forEach((pathInfo, index) => {
        console.log(`Adding path ${index + 1}:`, pathInfo);
        const pathItem = document.createElement('div');
        pathItem.className = 'path-item';
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${pathInfo.browser === 'Chrome' ? 'chrome' : 'firefox'}`;
        
        const pathText = document.createElement('span');
        pathText.className = 'path-text';
        pathText.textContent = pathInfo.path;
        
        const browserName = document.createElement('span');
        browserName.className = 'browser-name';
        browserName.textContent = pathInfo.browser;
        
        pathItem.appendChild(icon);
        pathItem.appendChild(pathText);
        pathItem.appendChild(browserName);
        
        pathList.appendChild(pathItem);
        console.log(`Added path item ${index + 1} to DOM`);
    });
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Permission Dialog Event Listeners
if (permissionGrant) {
    permissionGrant.addEventListener('click', handlePermissionGrant);
} else {
    console.error('Permission grant button not found');
}

if (permissionSkip) {
    permissionSkip.addEventListener('click', handlePermissionSkip);
} else {
    console.error('Permission skip button not found');
}

// Initialize
function initialize() {
    try {
        console.log('Initializing permission dialog...');
        console.log('window.api available:', !!window.api);

        // Set initial theme based on system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                applyTheme(e.matches);
            });
        }

        if (window.api) {
            console.log('Populating browser paths...');
            populateBrowserPaths();
            
            // Test: Add some dummy paths after a delay to see if display works
            setTimeout(() => {
                console.log('Adding test paths...');
                const testPaths = [
                    {
                        path: '/Users/test/Library/Application Support/Google/Chrome',
                        browser: 'Chrome'
                    },
                    {
                        path: '/Users/test/Library/Application Support/Firefox/Profiles',
                        browser: 'Firefox'
                    }
                ];
                displayBrowserPaths(testPaths);
            }, 2000);
        } else {
            console.error('Cannot initialize: window.api is not available');
        }
    } catch (error) {
        console.error('Error initializing permission dialog:', error);
        console.error('Error stack:', error.stack);
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Permission dialog DOM loaded, starting...');
    initialize();
}); 