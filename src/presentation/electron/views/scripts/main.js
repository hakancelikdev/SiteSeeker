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
const historyCounter = document.getElementById('historyCounter');
const bookmarkCounter = document.getElementById('bookmarkCounter');
const notification = document.getElementById('notification');
const importButton = document.querySelector('button[data-action="import"]');
const resetButton = document.querySelector('button[data-action="reset"]');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const errorRetry = document.getElementById('errorRetry');
const emptyState = document.getElementById('emptyState');
const INITIAL_SCORE = 1;

// State
let searchResults = [];
let currentSearchTerm = '';
let selectedResultIndex = -1;
let isCommandKeyPressed = false; // eslint-disable-line
let historyCount = 0;
let bookmarkCount = 0;

// Theme Management
let currentTheme = null; // No default theme, will be set by system

// Track Command key state
document.addEventListener('keydown', (event) => {
    if (event.key === 'Meta') {
        isCommandKeyPressed = true;
        if (window.api) {
            window.api.send('command-key-state', true);
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Meta') {
        isCommandKeyPressed = false;
        if (window.api) {
            window.api.send('command-key-state', false);
        }
    }
});

function applyTheme(isDarkMode) {
    currentTheme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
}

// Initialize theme based on system settings
if (window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(prefersDark.matches);

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        applyTheme(e.matches);
    });
}

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('keydown', handleKeyboardNavigation);

    // Add click event listener to the search wrapper
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper) {
        searchWrapper.addEventListener('click', () => {
            searchInput.focus();
        });
    }
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
    console.log('Setting up IPC event listeners...');

    window.api.receive('history-updated', (count) => {
        console.log('Received history-updated event with count:', count);
        console.log('Previous history count:', historyCount);
        historyCount = parseInt(count, 10) || 0;
        console.log('New history count:', historyCount);
        updateCounters();
    });

    window.api.receive('bookmarks-updated', (count) => {
        console.log('Received bookmarks-updated event with count:', count);
        console.log('Previous bookmark count:', bookmarkCount);
        bookmarkCount = parseInt(count, 10) || 0;
        console.log('New bookmark count:', bookmarkCount);
        updateCounters();
    });

    window.api.receive('search-results', (results) => {
        console.log('Received search results:', results);
        searchResults = results;
        renderResults();
    });

    window.api.receive('error', (message) => {
        console.error('Received error:', message);
        hideLoading();
        showNotification(message, 'error');
    });

    window.api.receive('importHistoryResponse', (response) => {
        console.log('Received import response:', response);
        hideLoading();
        if (!response.success) {
            showNotification(`Import failed: ${response.error}`, 'error');
        }
    });

    window.api.receive('resetHistoryResponse', (response) => {
        console.log('Received reset response:', response);
        hideLoading();
        if (response.success) {
            historyCount = 0;
            bookmarkCount = 0;
            updateCounters();
            clearResults();
            showNotification('History reset successfully', 'success');
        } else {
            showNotification(`Reset failed: ${response.error}`, 'error');
        }
    });

    // Listen for theme changes from main process
    window.api.receive('theme-changed', (data) => {
        applyTheme(data.isDarkMode);
    });
}

// Functions
function handleSearch(event) {
    try {
        currentSearchTerm = event.target.value.trim();
        console.log('Search input changed:', currentSearchTerm);

        if (currentSearchTerm) {
            showLoading('Searching...');
            if (window.api) {
                console.log('Sending search request for term:', currentSearchTerm);
                window.api.send('search', currentSearchTerm);
            } else {
                console.error('Cannot search: window.api is not available');
                showError('Search is not available', () => {
                    // Retry logic if needed
                });
            }
        } else {
            console.log('Clearing results due to empty search term');
            clearResults();
            hideEmptyState();
        }
    } catch (error) {
        console.error('Error handling search:', error);
        showError('Error performing search', () => {
            handleSearch(event);
        });
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
                    // Only hide window if Command key is not pressed
                    if (!event.metaKey) {
                        window.api.send('hide-window');
                    }
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
        hideLoading();

        if (searchResults.length === 0) {
            console.log('No results found, showing empty state');
            showEmptyState();
            return;
        }

        hideEmptyState();
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
        showError('Error displaying results', () => {
            renderResults();
        });
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

    // Add click handler directly to the div element
    div.onclick = (event) => {
        try {
            if (window.api) {
                window.api.send('open-url', result.url);
                // Only hide window if Command key is not pressed
                if (!event.metaKey) {
                    console.log('Command key not pressed, hiding window');
                    window.api.send('hide-window');
                }
            } else {
                console.error('Cannot open URL: window.api is not available');
            }
        } catch (error) {
            showNotification('Error opening URL', 'error');
        }
    };

    return div;
}

function clearResults() {
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

function updateCounters() {
    console.log('Updating counters - History:', historyCount, 'Bookmarks:', bookmarkCount);
    console.log('historyCounter element exists:', !!historyCounter);
    console.log('bookmarkCounter element exists:', !!bookmarkCounter);

    if (historyCounter) {
        console.log('Setting history counter text to:', historyCount.toString());
        historyCounter.textContent = historyCount.toString();
    } else {
        console.error('historyCounter element not found');
    }

    if (bookmarkCounter) {
        console.log('Setting bookmark counter text to:', bookmarkCount.toString());
        bookmarkCounter.textContent = bookmarkCount.toString();
    } else {
        console.error('bookmarkCounter element not found');
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

// Auto focus when window becomes visible
window.addEventListener('focus', () => {
    if (searchInput) {
        searchInput.focus();
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

// State Management Functions
function showLoading(message = 'Loading...') {
    if (loadingOverlay) {
        loadingOverlay.querySelector('.loading-text').textContent = message;
        loadingOverlay.classList.add('visible');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('visible');
    }
}

function showError(message, retryCallback = null) {
    if (errorOverlay) {
        errorMessage.textContent = message;
        errorOverlay.classList.add('visible');

        if (retryCallback) {
            errorRetry.onclick = () => {
                hideError();
                retryCallback();
            };
            errorRetry.style.display = 'block';
        } else {
            errorRetry.style.display = 'none';
        }
    }
}

function hideError() {
    if (errorOverlay) {
        errorOverlay.classList.remove('visible');
    }
}

function showEmptyState() {
    if (emptyState) {
        emptyState.classList.add('visible');
    }
}

function hideEmptyState() {
    if (emptyState) {
        emptyState.classList.remove('visible');
    }
}

// Import and Reset functions
function importAll() {
    showLoading('Importing browser data...');
    if (window.api) {
        window.api.send('importHistory');
    } else {
        showError('Import is not available');
    }
}

function resetHistory() {
    if (confirm('Are you sure you want to reset all history?')) {
        showLoading('Resetting history...');
        if (window.api) {
            window.api.send('resetHistory');
        } else {
            showError('Reset is not available');
        }
    }
}

// Initialize
function initialize() {
    try {
        console.log('Initializing application...');
        console.log('window.api available:', !!window.api);

        if (window.api) {
            console.log('Requesting initial counts...');
            window.api.send('get-url-count');
            console.log('Initial count request sent');
        } else {
            console.error('Cannot initialize: window.api is not available');
        }
    } catch (error) {
        console.error('Error initializing:', error);
        console.error('Error stack:', error.stack);
        showNotification('Error initializing application', 'error');
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application...');
    initialize();
});

// function handleImportClick() {
//     if (window.api) {
//         window.api.send('importHistory');
//     }
// }

// function handleResetClick() {
//     if (window.api) {
//         window.api.send('resetHistory');
//     }
// }

// function handleResultClick(result, event) {  // noqa: no-unused-vars
//     if (window.api) {
//         window.api.send('open-url', result.url);
//     }
// }
