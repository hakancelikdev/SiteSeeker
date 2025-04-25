// Debounce function implementation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM Elements
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const urlCounter = document.getElementById('urlCounter');
const notification = document.getElementById('notification');
const importButton = document.querySelector('button[data-action="import"]');
const resetButton = document.querySelector('button[data-action="reset"]');
const INITIAL_SCORE = 1;

// Log DOM elements for debugging
console.log('DOM Elements:', {
    searchInput: !!searchInput,
    resultsContainer: !!resultsContainer,
    urlCounter: !!urlCounter,
    notification: !!notification,
    importButton: !!importButton,
    resetButton: !!resetButton
});

// State
let searchResults = [];
let currentSearchTerm = '';

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}
document.addEventListener('keydown', handleKeyboardShortcuts);

if (importButton) {
    importButton.addEventListener('click', () => {
        console.log('Import button clicked');
        importHistory();
    });
} else {
    console.error('Import button not found');
}

if (resetButton) {
    resetButton.addEventListener('click', () => {
        console.log('Reset button clicked');
        resetHistory();
    });
} else {
    console.error('Reset button not found');
}

// Check if window.api exists
if (!window.api) {
    console.error('window.api is not available. Preload script might not be working correctly.');
}

// IPC Event Listeners
if (window.api) {
    window.api.receive('history-updated', (count) => {
        console.log('Received history-updated event with count:', count);
        updateUrlCounter(count);
        showNotification('History updated successfully', 'success');
    });

    window.api.receive('search-results', (results) => {
        console.log('Received search results:', results);
        searchResults = results;
        renderResults();
    });

    window.api.receive('error', (message) => {
        console.error('Received error:', message);
        showNotification(message, 'error');
    });

    window.api.receive('importHistoryResponse', (response) => {
        console.log('Received import response:', response);
        if (response.success) {
            updateUrlCounter(response.count);
            showNotification(`Successfully imported ${response.count} history items`, 'success');
        } else {
            showNotification(`Import failed: ${response.error}`, 'error');
        }
    });

    window.api.receive('resetHistoryResponse', (response) => {
        console.log('Received reset response:', response);
        if (response.success) {
            updateUrlCounter(0);
            clearResults();
            showNotification('History reset successfully', 'success');
        } else {
            showNotification(`Reset failed: ${response.error}`, 'error');
        }
    });
}

// Functions
function handleSearch(event) {
    try {
        currentSearchTerm = event.target.value.trim();
        console.log('Search input changed:', currentSearchTerm);
        
        if (currentSearchTerm) {
            if (window.api) {
                console.log('Sending search request for term:', currentSearchTerm);
                window.api.send('search', currentSearchTerm);
            } else {
                console.error('Cannot search: window.api is not available');
                showNotification('Search is not available', 'error');
            }
        } else {
            console.log('Clearing results due to empty search term');
            clearResults();
        }
    } catch (error) {
        console.error('Error handling search:', error);
        showNotification('Error performing search', 'error');
    }
}

function renderResults() {
    try {
        console.log('Rendering search results:', searchResults);
        clearResults();
        
        if (searchResults.length === 0) {
            console.log('No results found, showing empty state');
            resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        console.log(`Rendering ${searchResults.length} results`);
        const fragment = document.createDocumentFragment();
        
        searchResults.forEach((result, index) => {
            console.log(`Creating result element ${index + 1}:`, result);
            const resultElement = createResultElement(result);
            fragment.appendChild(resultElement);
        });

        resultsContainer.appendChild(fragment);
        console.log('Results rendered successfully');
    } catch (error) {
        console.error('Error rendering results:', error);
        showNotification('Error displaying results', 'error');
    }
}

function createResultElement(result) {
    const div = document.createElement('div');
    div.className = 'result-item';
    
    const title = document.createElement('div');
    title.className = 'result-title';
    title.textContent = result.title || 'Untitled';
    
    const url = document.createElement('div');
    url.className = 'result-url';
    url.textContent = result.url;
    
    const meta = document.createElement('div');
    meta.className = 'result-meta';
    
    const visitCount = document.createElement('span');
    visitCount.className = 'visit-count';
    visitCount.innerHTML = `<i class="fas fa-eye"></i> ${result.score - INITIAL_SCORE}`;
    
    const lastVisit = document.createElement('span');
    lastVisit.className = 'last-visit';
    lastVisit.innerHTML = `<i class="fas fa-clock"></i> ${formatDate(result.lastVisitTime)}`;
    
    meta.appendChild(visitCount);
    meta.appendChild(lastVisit);
    
    div.appendChild(title);
    div.appendChild(url);
    div.appendChild(meta);
    
    div.addEventListener('click', () => {
        try {
            if (window.api) {
                window.api.send('open-url', result.url);
            } else {
                console.error('Cannot open URL: window.api is not available');
            }
        } catch (error) {
            console.error('Error opening URL:', error);
            showNotification('Error opening URL', 'error');
        }
    });

    return div;
}

function clearResults() {
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

function updateUrlCounter(count) {
    console.log('Updating URL counter to:', count);
    if (urlCounter) {
        urlCounter.textContent = count;
    } else {
        console.error('URL counter element not found');
    }
}

function showNotification(message, type = 'info') {
    try {
        console.log('Showing notification:', message, type);
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            console.error('Notification element not found');
        }
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function handleKeyboardShortcuts(event) {
    try {
        // Cmd + Shift + Space for focusing search
        if (event.metaKey && event.shiftKey && event.code === 'Space') {
            if (searchInput) {
                searchInput.focus();
            }
        }
    } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
    }
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // If less than 24 hours ago, show relative time
        if (diff < 24 * 60 * 60 * 1000) {
            if (diff < 60 * 1000) return 'Just now';
            if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
            return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
        }
        
        // If less than a week ago, show day name
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString(undefined, { weekday: 'long' });
        }
        
        // Otherwise show full date
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Import and Reset functions
function importHistory() {
    try {
        console.log('Importing history...');
        showNotification('Importing history...', 'info');
        if (window.api) {
            window.api.send('importHistory');
        } else {
            console.error('Cannot import history: window.api is not available');
        }
    } catch (error) {
        console.error('Error importing history:', error);
        showNotification('Error importing history', 'error');
    }
}

function resetHistory() {
    try {
        if (confirm('Are you sure you want to reset all history? This action cannot be undone.')) {
            console.log('Resetting history...');
            showNotification('Resetting history...', 'info');
            if (window.api) {
                window.api.send('resetHistory');
            } else {
                console.error('Cannot reset history: window.api is not available');
            }
        }
    } catch (error) {
        console.error('Error resetting history:', error);
        showNotification('Error resetting history', 'error');
    }
}

// Initialize
function initialize() {
    try {
        console.log('Initializing application...');
        if (window.api) {
            window.api.send('get-url-count');
        } else {
            console.error('Cannot initialize: window.api is not available');
        }
    } catch (error) {
        console.error('Error initializing:', error);
        showNotification('Error initializing application', 'error');
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application...');
    initialize();
});
