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
let selectedResultIndex = -1;

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('keydown', handleKeyboardNavigation);
}
document.addEventListener('keydown', handleKeyboardShortcuts);

if (importButton) {
    importButton.addEventListener('click', () => {
        console.log('Import button clicked');
        importAll();
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
    let historyCount = 0;
    let bookmarkCount = 0;

    window.api.receive('history-updated', (count) => {
        console.log('Received history-updated event with count:', count);
        historyCount = count;
        updateUrlCounter(count);
    });

    window.api.receive('bookmark-import-complete', (count) => {
        console.log('Received bookmark-import-complete event with count:', count);
        bookmarkCount = count;
        showNotification(`Successfully imported ${historyCount} history items and ${bookmarkCount} bookmarks`, 'success');
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
        if (!response.success) {
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

function handleKeyboardNavigation(event) {
    if (!searchResults.length) return;

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (selectedResultIndex < searchResults.length - 1) {
                selectedResultIndex++;
            } else {
                selectedResultIndex = 0;
            }
            updateSelectedResult();
            break;

        case 'ArrowUp':
            event.preventDefault();
            if (selectedResultIndex > 0) {
                selectedResultIndex--;
            } else {
                selectedResultIndex = searchResults.length - 1;
            }
            updateSelectedResult();
            break;

        case 'Enter':
            event.preventDefault();
            if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
                const selectedResult = searchResults[selectedResultIndex];
                if (window.api) {
                    window.api.send('open-url', selectedResult.url);
                }
            }
            break;
    }
}

function updateSelectedResult() {
    const resultItems = resultsContainer.querySelectorAll('.result-item');
    resultItems.forEach((item, index) => {
        if (index === selectedResultIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function renderResults() {
    try {
        console.log('Rendering search results:', searchResults);
        clearResults();
        selectedResultIndex = -1;
        
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
    
    // Create favicon element
    const favicon = document.createElement('img');
    favicon.className = 'result-icon';
    favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=32`;
    favicon.alt = '';
    favicon.onerror = () => {
        favicon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    };

    const content = document.createElement('div');
    content.className = 'result-content';
    
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
    
    content.appendChild(title);
    content.appendChild(url);
    content.appendChild(meta);

    div.appendChild(favicon);
    div.appendChild(content);
    
    if (result.isBookmark) {
        const starIcon = document.createElement('span');
        starIcon.className = 'bookmark-icon';
        starIcon.innerHTML = '★';
        div.appendChild(starIcon);
    }

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
                event.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        }
    } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
    }
}

// Pencere görünür olduğunda otomatik odaklanma
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && searchInput) {
        searchInput.focus();
        searchInput.select();
    }
});

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // If less than 1 minute ago
        if (diff < 60 * 1000) {
            const seconds = Math.floor(diff / 1000);
            return seconds === 0 ? 'Just now' : `${seconds} seconds ago`;
        }
        
        // If less than 1 hour ago
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
        }
        
        // If less than 24 hours ago
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        }
        
        // If less than 7 days ago
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return days === 1 ? 'Yesterday' : `${days} days ago`;
        }
        
        // If less than 30 days ago
        if (diff < 30 * 24 * 60 * 60 * 1000) {
            const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        }
        
        // If less than 1 year ago
        if (diff < 365 * 24 * 60 * 60 * 1000) {
            const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
            return months === 1 ? '1 month ago' : `${months} months ago`;
        }
        
        // Otherwise show years
        const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
        return years === 1 ? '1 year ago' : `${years} years ago`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

// Import and Reset functions
function importAll() {
    try {
        console.log('Importing history and bookmarks...');
        showNotification('Importing history and bookmarks...', 'info');
        if (window.api) {
            window.api.send('importHistory');
        } else {
            console.error('Cannot import: window.api is not available');
        }
    } catch (error) {
        console.error('Error importing:', error);
        showNotification('Error importing', 'error');
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
