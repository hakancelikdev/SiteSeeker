const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const Store = require('electron-store');
const Database = require('better-sqlite3');
const fs = require('fs');
const os = require('os');

let store;

try {
  store = new Store({
    name: 'siteseeker-store',
    clearInvalidConfig: true
  });
} catch (error) {
  log.error('Failed to initialize electron-store:', error);
}

// Logging for automatic updates
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Create update directories
const updaterCachePath = path.join(app.getPath('userData'), 'update-cache');
const pendingUpdatePath = path.join(updaterCachePath, 'pending');

try {
  if (!fs.existsSync(updaterCachePath)) {
    fs.mkdirSync(updaterCachePath, { recursive: true });
  }
  if (!fs.existsSync(pendingUpdatePath)) {
    fs.mkdirSync(pendingUpdatePath, { recursive: true });
  }
} catch (error) {
  log.error('Error creating update directories:', error);
}

// Update configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('error', (error) => {
  log.error('Update error:', error);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', error.message);
  }
});

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded: ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  log.info(message);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// For storing history data
const INITIAL_SCORE = 1;

let mainWindow = null;
let isVisible = false;

// Auto start on system startup
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
  path: app.getPath('exe')
});

// Load history data
async function loadHistory() {
  if (!store) {
    console.log('Store not loaded yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!store) {
    console.error('Store still could not be loaded!');
    return [];
  }
  return store.get('savedHistory', []);
}

// Get only record count
async function getHistoryCount() {
  if (!store) {
    console.log('Store not loaded yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!store) {
    console.error('Store still could not be loaded!');
    return 0;
  }
  const count = store.get('historyCount', 0);
  console.log(`Total record count: ${count}`);
  
  // Send URL count to main window
  if (mainWindow) {
    mainWindow.webContents.send('update-url-count', count);
  }
  
  return count;
}

// Save history data
async function saveHistory(history) {
  if (!store) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!store) return;
  
  store.set('savedHistory', history);
  store.set('historyCount', history.length);
  
  // Send URL count to main window
  if (mainWindow) {
    mainWindow.webContents.send('update-url-count', history.length);
  }
}

// Search in history
async function searchHistory(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.log('Invalid search term:', searchTerm);
    return [];
  }

  console.log(`Search term: "${searchTerm}"`);
  const history = await loadHistory();
  const searchTermLower = searchTerm.toLowerCase();
  
  const results = history
    .filter(item => 
      item.title?.toLowerCase().includes(searchTermLower) ||
      item.url?.toLowerCase().includes(searchTermLower)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  console.log(`Number of results found: ${results.length}`);
  return results;
}

// Chrome history
const chromeBasePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');

// Firefox history
const firefoxPath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');

// Remove duplicate records
const uniqueUrls = new Set();

// Import browser histories
async function importBrowserHistories() {
  try {
    console.log('Starting browser history import...');
    const os = require('os');
    const fs = require('fs');
    
    let allHistory = [];
    
    // Chrome geçmişi
    if (fs.existsSync(chromeBasePath)) {
      const profiles = fs.readdirSync(chromeBasePath)
        .filter(item => {
          const itemPath = path.join(chromeBasePath, item);
          return fs.existsSync(itemPath) && 
                 fs.statSync(itemPath).isDirectory() && 
                 fs.existsSync(path.join(itemPath, 'History'));
        });

      for (const profile of profiles) {
        try {
          const historyPath = path.join(chromeBasePath, profile, 'History');
          const tempPath = path.join(app.getPath('temp'), `chrome_history_temp_${profile}`);
          fs.copyFileSync(historyPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT url, title, visit_count, typed_count, last_visit_time
            FROM urls
            WHERE title IS NOT NULL
            ORDER BY last_visit_time DESC
          `).all();
          
          db.close();
          fs.unlinkSync(tempPath);
          
          const chromeHistory = results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE + (item.visit_count || 0) + (item.typed_count || 0) * 2,
            lastVisitTime: item.last_visit_time,
            source: 'Chrome'
          }));
          
          allHistory = allHistory.concat(chromeHistory);
          console.log(`Number of records from Chrome ${profile} profile:`, chromeHistory.length);
        } catch (error) {
          console.error(`Error getting Chrome ${profile} history:`, error);
        }
      }
    }

    // Firefox geçmişi
    if (fs.existsSync(firefoxPath)) {
      const profiles = fs.readdirSync(firefoxPath)
        .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
      
      for (const profile of profiles) {
        try {
          const historyPath = path.join(firefoxPath, profile, 'places.sqlite');
          if (!fs.existsSync(historyPath)) continue;
          
          const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);
          fs.copyFileSync(historyPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT url, title, visit_count, typed, last_visit_date
            FROM moz_places
            WHERE title IS NOT NULL
            ORDER BY last_visit_date DESC
          `).all();
          
          db.close();
          fs.unlinkSync(tempPath);
          
          const firefoxHistory = results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE + (item.visit_count || 0) + (item.typed || 0) * 2,
            lastVisitTime: item.last_visit_date,
            source: 'Firefox'
          }));
          
          allHistory = allHistory.concat(firefoxHistory);
          console.log('Number of records from Firefox profile:', firefoxHistory.length);
        } catch (error) {
          console.error('Error getting Firefox history:', error);
        }
      }
    }

    // Tekrar eden kayıtları temizle
    allHistory = allHistory.filter(item => {
      if (uniqueUrls.has(item.url)) {
        return false;
      }
      uniqueUrls.add(item.url);
      return true;
    });

    // Geçmişi kaydet
    await saveHistory(allHistory);
    
    return {
      success: true,
      totalItems: allHistory.length,
      error: null
    };
  } catch (error) {
    console.error('Error importing browser histories:', error);
    return {
      success: false,
      totalItems: 0,
      error: error.message
    };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Pencereyi ekranın ortasına yerleştir
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  mainWindow.setPosition(
    Math.floor(width / 2 - 400),
    Math.floor(height / 2 - 300)
  );

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
      isVisible = false;
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      isVisible = false;
    }
  });
}

// Check permissions
function checkPermissions() {
  try {
    // Check Chrome history permissions
    const chromeHistoryPath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default/History');
    if (fs.existsSync(chromeHistoryPath)) {
      try {
        fs.accessSync(chromeHistoryPath, fs.constants.R_OK);
        log.info('Chrome history access permission available');
      } catch (error) {
        log.warn('No Chrome history access permission, requesting...');
        showPermissionDialog();
        return false;
      }
    }

    // Check Firefox history permissions
    const firefoxProfilesPath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
    if (fs.existsSync(firefoxProfilesPath)) {
      const profiles = fs.readdirSync(firefoxProfilesPath)
        .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
      
      for (const profile of profiles) {
        const historyPath = path.join(firefoxProfilesPath, profile, 'places.sqlite');
        if (fs.existsSync(historyPath)) {
          try {
            fs.accessSync(historyPath, fs.constants.R_OK);
            log.info('Firefox history access permission available');
          } catch (error) {
            log.warn('No Firefox history access permission, requesting...');
            showPermissionDialog();
            return false;
          }
        }
      }
    }

    return true;
  } catch (error) {
    log.error('Error during permission check:', error);
    return false;
  }
}

// Permission request dialog
function showPermissionDialog() {
  const { dialog } = require('electron');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Full Disk Access Required',
    message: 'SiteSeeker needs full disk access to access browser history.',
    detail: 'Please allow SiteSeeker application access in System Settings > Privacy & Security > Full Disk Access.',
    buttons: ['OK'],
    defaultId: 0
  });
}

// Import history on first run and every minute
let isFirstRun = true;
async function autoImportHistory() {
  try {
    if (isFirstRun) {
      // Get all history on first run
      const result = await importBrowserHistories();
      if (result.success) {
        log.info(`First history import successful. Total records: ${result.totalItems}`);
      } else {
        log.error('First history import failed:', result.error);
      }
      isFirstRun = false;
    } else {
      // Get last 2 minutes history on subsequent runs
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000); // 2 minutes ago
      
      // Last 2 minutes history for Chrome
      if (fs.existsSync(chromeBasePath)) {
        const profiles = fs.readdirSync(chromeBasePath)
          .filter(item => {
            const itemPath = path.join(chromeBasePath, item);
            return fs.existsSync(itemPath) && 
                   fs.statSync(itemPath).isDirectory() && 
                   fs.existsSync(path.join(itemPath, 'History'));
          });

        for (const profile of profiles) {
          try {
            const historyPath = path.join(chromeBasePath, profile, 'History');
            const tempPath = path.join(app.getPath('temp'), `chrome_history_temp_${profile}`);
            fs.copyFileSync(historyPath, tempPath);
            
            const db = new Database(tempPath, { readonly: true });
            
            const results = db.prepare(`
              SELECT url, title, visit_count, typed_count
              FROM urls
              WHERE title IS NOT NULL
              AND last_visit_time/1000000 + (strftime('%s', '1601-01-01')) > ?
              ORDER BY last_visit_time DESC
            `).all(Math.floor(twoMinutesAgo / 1000));
            
            // Load current history
            let savedHistory = await loadHistory();
            
            // Add or update new records
            results.forEach(item => {
              const existingIndex = savedHistory.findIndex(h => h.url === item.url);
              const newItem = {
                url: item.url,
                title: item.title,
                score: INITIAL_SCORE + item.visit_count + (item.typed_count || 0),
                source: `Chrome (${profile})`
              };
              
              if (existingIndex >= 0) {
                savedHistory[existingIndex] = {
                  ...savedHistory[existingIndex],
                  ...newItem,
                  score: Math.max(savedHistory[existingIndex].score, newItem.score)
                };
              } else {
                savedHistory.push(newItem);
              }
            });
            
            // Save history
            await saveHistory(savedHistory);
            
            db.close();
            fs.unlinkSync(tempPath);
          } catch (error) {
            console.error(`Error getting Chrome ${profile} recent history:`, error);
          }
        }
      }
      
      // Last 2 minutes history for Firefox
      if (fs.existsSync(firefoxPath)) {
        const profiles = fs.readdirSync(firefoxPath)
          .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
        
        for (const profile of profiles) {
          try {
            const historyPath = path.join(firefoxPath, profile, 'places.sqlite');
            if (!fs.existsSync(historyPath)) continue;
            
            const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);
            fs.copyFileSync(historyPath, tempPath);
            
            const db = new Database(tempPath, { readonly: true });
            
            const results = db.prepare(`
              SELECT url, title, visit_count
              FROM moz_places
              WHERE title IS NOT NULL
              AND last_visit_date/1000000 > ?
              ORDER BY last_visit_date DESC
            `).all(twoMinutesAgo);
            
            // Load current history
            let savedHistory = await loadHistory();
            
            // Add or update new records
            results.forEach(item => {
              const existingIndex = savedHistory.findIndex(h => h.url === item.url);
              const newItem = {
                url: item.url,
                title: item.title,
                score: INITIAL_SCORE + item.visit_count,
                source: `Firefox (${profile})`
              };
              
              if (existingIndex >= 0) {
                savedHistory[existingIndex] = {
                  ...savedHistory[existingIndex],
                  ...newItem,
                  score: Math.max(savedHistory[existingIndex].score, newItem.score)
                };
              } else {
                savedHistory.push(newItem);
              }
            });
            
            // Save history
            await saveHistory(savedHistory);
            
            db.close();
            fs.unlinkSync(tempPath);
          } catch (error) {
            console.error(`Error getting Firefox ${profile} recent history:`, error);
          }
        }
      }
      
      // Safari için son 2 dakikalık geçmiş
      const safariHistoryPath = path.join(os.homedir(), 'Library/Safari/History.db');
      if (fs.existsSync(safariHistoryPath)) {
        try {
          const tempPath = path.join(app.getPath('temp'), 'safari_history_temp');
          fs.copyFileSync(safariHistoryPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT h.url, h.title, COUNT(v.id) as visit_count
            FROM history_items h
            LEFT JOIN history_visits v ON v.history_item = h.id
            WHERE h.title IS NOT NULL AND h.title != ''
            AND v.visit_time > ?
            GROUP BY h.id
            ORDER BY MAX(v.visit_time) DESC
          `).all(twoMinutesAgo);
          
          // Mevcut geçmişi yükle
          let savedHistory = await loadHistory();
          
          // Yeni kayıtları ekle veya güncelle
          results.forEach(item => {
            const existingIndex = savedHistory.findIndex(h => h.url === item.url);
            const newItem = {
              url: item.url,
              title: item.title,
              score: INITIAL_SCORE + (item.visit_count || 1),
              source: 'Safari'
            };
            
            if (existingIndex >= 0) {
              savedHistory[existingIndex] = {
                ...savedHistory[existingIndex],
                ...newItem,
                score: Math.max(savedHistory[existingIndex].score, newItem.score)
              };
            } else {
              savedHistory.push(newItem);
            }
          });
          
          // Değişiklikleri kaydet
          await saveHistory(savedHistory);
          
          db.close();
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.error('Error getting Safari recent history:', error);
        }
      }
    }
  } catch (error) {
    log.error('Automatic history import error:', error);
  }
  
  if (isFirstRun) {
    // İlk çalıştırmadan sonra her dakikada bir çalıştır
    setInterval(autoImportHistory, 60000);
  }
}

app.on('ready', async () => {
  // İzinleri kontrol et
  await checkPermissions();
  
  createWindow();
  autoImportHistory();
  
  // İlk yüklemede sadece URL sayısını güncelle
  getHistoryCount();

  // Global kısayol tuşu kaydet
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (isVisible) {
      mainWindow.hide();
      isVisible = false;
    } else {
      mainWindow.show();
      isVisible = true;
      mainWindow.webContents.send('show-window');
      // Pencere gösterildiğinde sadece URL sayısını güncelle
      getHistoryCount();
    }
  });

  // Güncellemeleri kontrol et
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdates();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// IPC olayları
ipcMain.on('search-history', async (event, searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      console.log('Invalid search term received:', searchTerm);
      event.reply('search-results', []);
      return;
    }

    const results = await searchHistory(searchTerm);
    console.log('Search term:', searchTerm);
    console.log('Number of results found:', results.length);
    event.reply('search-results', results);
  } catch (error) {
    console.error('Search error:', error);
    event.reply('search-results', []);
  }
});

ipcMain.on('import-chrome-history', async (event) => {
  try {
    const result = await importBrowserHistories();
    event.reply('import-complete', result);
  } catch (error) {
    console.error('Import error:', error);
    event.reply('import-complete', { success: false, error: error.message });
  }
});

ipcMain.on('open-url', (event, url) => {
  require('electron').shell.openExternal(url);
});

ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow) {
    const currentPosition = mainWindow.getPosition();
    mainWindow.setSize(width, height);
    mainWindow.setPosition(currentPosition[0], currentPosition[1]);
  }
});

// Geçmişi sıfırla
async function resetHistory() {
  try {
    await saveHistory([]);
    return { success: true };
  } catch (error) {
    console.error('History reset error:', error);
    return { success: false, error: error.message };
  }
}

ipcMain.on('reset-history', async (event) => {
  try {
    const result = await resetHistory();
    event.reply('reset-complete', result);
  } catch (error) {
    console.error('Reset error:', error);
    event.reply('reset-complete', { success: false, error: error.message });
  }
});

// Son geçmişi kontrol et
async function checkRecentHistory() {
  try {
    let recentHistory = [];
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000); // 2 minutes ago

    // Chrome için son 2 dakikalık geçmiş
    if (fs.existsSync(chromeBasePath)) {
      const profiles = fs.readdirSync(chromeBasePath)
        .filter(item => {
          const itemPath = path.join(chromeBasePath, item);
          return fs.existsSync(itemPath) && 
                 fs.statSync(itemPath).isDirectory() && 
                 fs.existsSync(path.join(itemPath, 'History'));
        });

      for (const profile of profiles) {
        try {
          const historyPath = path.join(chromeBasePath, profile, 'History');
          const tempPath = path.join(app.getPath('temp'), `chrome_history_temp_${profile}`);
          fs.copyFileSync(historyPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT url, title, last_visit_time
            FROM urls
            WHERE title IS NOT NULL
            AND last_visit_time/1000000 + (strftime('%s', '1601-01-01')) * 1000 > ?
            ORDER BY last_visit_time DESC
          `).all(twoMinutesAgo);
          
          db.close();
          fs.unlinkSync(tempPath);
          
          const chromeHistory = results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE,
            source: 'Chrome'
          }));
          
          recentHistory = recentHistory.concat(chromeHistory);
        } catch (error) {
          console.error('Chrome son geçmişi alınırken hata:', error);
        }
      }
    }

    // Firefox için son 2 dakikalık geçmiş
    if (fs.existsSync(firefoxPath)) {
      const profiles = fs.readdirSync(firefoxPath)
        .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
      
      for (const profile of profiles) {
        try {
          const historyPath = path.join(firefoxPath, profile, 'places.sqlite');
          if (!fs.existsSync(historyPath)) continue;
          
          const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);
          fs.copyFileSync(historyPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT url, title, last_visit_date/1000 as last_visit_time
            FROM moz_places
            WHERE title IS NOT NULL
            AND last_visit_date/1000 > ?
            ORDER BY last_visit_date DESC
          `).all(twoMinutesAgo);
          
          db.close();
          fs.unlinkSync(tempPath);
          
          const firefoxHistory = results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE,
            source: 'Firefox'
          }));
          
          recentHistory = recentHistory.concat(firefoxHistory);
        } catch (error) {
          console.error('Firefox son geçmişi alınırken hata:', error);
        }
      }
    }

    // Yeni geçmiş kayıtlarını mevcut geçmişe ekle
    if (recentHistory.length > 0) {
      const currentHistory = await loadHistory();
      const uniqueUrls = new Set(currentHistory.map(item => item.url));
      
      const newHistory = recentHistory.filter(item => !uniqueUrls.has(item.url));
      
      if (newHistory.length > 0) {
        const updatedHistory = [...newHistory, ...currentHistory];
        
        await saveHistory(updatedHistory);
        console.log(`${newHistory.length} new records added`);
      }
    }
  } catch (error) {
    console.error('Error during recent history check:', error);
  }
}

// Export functions for testing
module.exports = {
  searchHistory,
  importBrowserHistories,
  getChromeProfiles,
  loadHistory,
  getHistoryCount,
  saveHistory,
  checkPermissions,
  showPermissionDialog,
  autoImportHistory,
  resetHistory,
  checkRecentHistory,
}; 