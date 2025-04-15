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

// Otomatik güncelleme için logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Geçmiş verilerini saklamak için
const INITIAL_SCORE = 1;
const MAX_ITEMS = 10000;

let mainWindow = null;
let isVisible = false;

// Sistem başlangıcında otomatik başlatma
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
  path: app.getPath('exe')
});

// Geçmiş verilerini yükle
async function loadHistory() {
  if (!store) {
    console.log('Store henüz yüklenmedi, bekleniyor...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Daha uzun bekleme süresi
  }
  if (!store) {
    console.error('Store hala yüklenemedi!');
    return [];
  }
  const history = store.get('savedHistory', []);
  console.log(`Yüklenen geçmiş kayıt sayısı: ${history.length}`);
  return history;
}

// Geçmiş verilerini kaydet
async function saveHistory(history) {
  if (!store) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!store) return;
  
  if (history.length > MAX_ITEMS) {
    history.sort((a, b) => b.score - a.score);
    history = history.slice(0, MAX_ITEMS);
  }
  store.set('savedHistory', history);
}

// Geçmişte arama yap
async function searchHistory(searchTerm) {
  console.log(`Arama terimi: "${searchTerm}"`);
  const history = await loadHistory();
  const searchTermLower = searchTerm.toLowerCase();
  
  const results = history
    .filter(item => 
      item.title.toLowerCase().includes(searchTermLower) ||
      item.url.toLowerCase().includes(searchTermLower)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  console.log(`Bulunan sonuç sayısı: ${results.length}`);
  if (results.length > 0) {
    console.log('İlk birkaç sonuç:', results.slice(0, 3));
  }
  
  return results;
}

// Chrome profil listesini al
async function getChromeProfiles() {
  try {
    const os = require('os');
    const fs = require('fs');
    const profilesPath = path.join(
      os.homedir(),
      'Library/Application Support/Google/Chrome'
    );

    console.log('Chrome profil dizini:', profilesPath);

    // Profil dizininin varlığını kontrol et
    if (!fs.existsSync(profilesPath)) {
      console.error('Chrome profil dizini bulunamadı:', profilesPath);
      return [];
    }

    // Profil dizinlerini oku
    const items = fs.readdirSync(profilesPath);
    console.log('Bulunan dizinler:', items);

    const profiles = [];
    
    // Her bir dizini kontrol et
    for (const item of items) {
      try {
        const itemPath = path.join(profilesPath, item);
        const historyPath = path.join(itemPath, 'History');
        
        // Sadece dizin olup olmadığını ve History dosyasının varlığını kontrol et
        if (fs.existsSync(itemPath) && 
            fs.statSync(itemPath).isDirectory() && 
            fs.existsSync(historyPath) && 
            (item === 'Default' || item.startsWith('Profile '))) {
          
          profiles.push({
            id: item,
            name: item === 'Default' ? 'Varsayılan Profil' : `Profil ${item.replace('Profile ', '')}`
          });
          
          console.log(`Geçerli profil bulundu: ${item}`);
        }
      } catch (err) {
        console.log(`${item} dizini kontrol edilirken hata:`, err.message);
        continue;
      }
    }

    console.log('Bulunan profiller:', profiles);
    return profiles;
  } catch (error) {
    console.error('Profil listesi alınırken detaylı hata:', error);
    return [];
  }
}

// Tarayıcı geçmişlerini içe aktar
async function importBrowserHistories() {
  try {
    console.log('Tarayıcı geçmişleri import işlemi başlatılıyor...');
    const os = require('os');
    const fs = require('fs');
    
    let allHistory = [];
    let safariPermissionError = false;
    
    // Chrome geçmişi
    const chromeBasePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
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
            ORDER BY last_visit_time DESC
            LIMIT 1000
          `).all();
          
          allHistory.push(...results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE + item.visit_count + (item.typed_count || 0),
            source: `Chrome (${profile})`
          })));
          
          db.close();
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.error(`Chrome ${profile} geçmişi alınırken hata:`, error);
        }
      }
    }
    
    // Firefox geçmişi
    const firefoxBasePath = path.join(os.homedir(), 'Library/Application Support/Firefox/Profiles');
    if (fs.existsSync(firefoxBasePath)) {
      const profiles = fs.readdirSync(firefoxBasePath)
        .filter(item => item.endsWith('.default') || item.endsWith('.default-release'));
      
      for (const profile of profiles) {
        try {
          const historyPath = path.join(firefoxBasePath, profile, 'places.sqlite');
          if (!fs.existsSync(historyPath)) continue;
          
          const tempPath = path.join(app.getPath('temp'), `firefox_history_temp_${profile}`);
          fs.copyFileSync(historyPath, tempPath);
          
          const db = new Database(tempPath, { readonly: true });
          
          const results = db.prepare(`
            SELECT url, title, visit_count
            FROM moz_places
            WHERE title IS NOT NULL
            ORDER BY last_visit_date DESC
            LIMIT 1000
          `).all();
          
          allHistory.push(...results.map(item => ({
            url: item.url,
            title: item.title,
            score: INITIAL_SCORE + item.visit_count,
            source: `Firefox (${profile})`
          })));
          
          db.close();
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.error(`Firefox ${profile} geçmişi alınırken hata:`, error);
        }
      }
    }
    
    // Safari geçmişi
    const safariHistoryPath = path.join(os.homedir(), 'Library/Safari/History.db');
    if (fs.existsSync(safariHistoryPath)) {
      try {
        const tempPath = path.join(app.getPath('temp'), 'safari_history_temp');
        fs.copyFileSync(safariHistoryPath, tempPath);
        
        const db = new Database(tempPath, { readonly: true });

        // Safari'nin History.db şemasını kontrol et
        const tables = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();
        console.log('Safari veritabanı tabloları:', tables);

        // Önce tabloların yapısını kontrol et
        for (const table of tables) {
          const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
          console.log(`${table.name} tablosunun yapısı:`, columns);
        }
        
        // Farklı bir sorgu deneyelim
        let results = db.prepare(`
          SELECT h.url, h.title, COUNT(v.id) as visit_count
          FROM history_items h
          LEFT JOIN history_visits v ON v.history_item = h.id
          WHERE h.title IS NOT NULL AND h.title != ''
          GROUP BY h.id
          ORDER BY MAX(v.visit_time) DESC
          LIMIT 1000
        `).all();
        
        if (results.length === 0) {
          console.log('Safari geçmişinde kayıt bulunamadı, alternatif sorgu deneniyor...');
          // Alternatif sorgu dene
          results = db.prepare(`
            SELECT url, title, 1 as visit_count
            FROM history_items
            WHERE title IS NOT NULL AND title != ''
            ORDER BY id DESC
            LIMIT 1000
          `).all();
        }
        
        console.log('Safari geçmişinden alınan kayıt sayısı:', results.length);
        
        allHistory.push(...results.map(item => ({
          url: item.url,
          title: item.title,
          score: INITIAL_SCORE + (item.visit_count || 1),
          source: 'Safari'
        })));
        
        db.close();
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error('Safari geçmişi alınırken hata:', error);
        if (error.code === 'EPERM') {
          safariPermissionError = true;
        }
      }
    }
    
    // Mevcut geçmişi yükle ve yeni kayıtları ekle
    let savedHistory = await loadHistory();
    console.log(`Mevcut kayıt sayısı: ${savedHistory.length}`);
    
    // URL'ye göre benzersiz kayıtları birleştir
    const urlMap = new Map();
    
    // Önce yeni kayıtları ekle (score değeri geçerli olanları)
    allHistory.forEach(item => {
      // Score değeri kontrolü
      if (!item.score || item.score <= 0) {
        return; // Score değeri geçersiz olan kayıtları atla
      }

      urlMap.set(item.url, {
        ...item,
        sources: [item.source]
      });
    });
    
    // Mevcut kayıtları kontrol et ve sadece geçerli score değeri olanları ekle
    let addedCount = 0;
    let updatedCount = 0;
    
    savedHistory.forEach(item => {
      // Mevcut kayıtlarda da score kontrolü yap
      if (!item.score || item.score <= 0) {
        return; // Score değeri geçersiz olan kayıtları atla
      }

      if (!urlMap.has(item.url)) {
        // Eğer URL yeni kayıtlarda yoksa, mevcut kaydı koru
        urlMap.set(item.url, item);
      } else {
        // Eğer URL yeni kayıtlarda varsa, source bilgisini güncelle
        const newItem = urlMap.get(item.url);
        if (item.sources) {
          item.sources.forEach(source => {
            if (!newItem.sources.includes(source)) {
              newItem.sources.push(source);
            }
          });
        }
        updatedCount++;
      }
    });
    
    // Map'ten final listeyi oluştur
    savedHistory = Array.from(urlMap.values());
    addedCount = savedHistory.length - updatedCount;
    
    console.log(`Eklenen yeni kayıt: ${addedCount}, Güncellenen kayıt: ${updatedCount}, Toplam kayıt: ${savedHistory.length}`);
    
    // Kaydet
    await saveHistory(savedHistory);
    
    // Kaynak bazında istatistikleri hesapla
    const sourceStats = new Map();
    savedHistory.forEach(item => {
      if (item.source) {
        const count = sourceStats.get(item.source) || 0;
        sourceStats.set(item.source, count + 1);
      }
      if (item.sources) {
        item.sources.forEach(source => {
          const count = sourceStats.get(source) || 0;
          sourceStats.set(source, count + 1);
        });
      }
    });

    const sources = Array.from(sourceStats.entries()).map(([name, count]) => ({
      name,
      count
    }));
    
    console.log('Tüm tarayıcı geçmişleri başarıyla import edildi');
    return { 
      success: true, 
      safariPermissionError,
      totalRecords: savedHistory.length,
      addedCount,
      updatedCount,
      sources
    };
  } catch (error) {
    console.error('Tarayıcı geçmişleri içe aktarılırken hata:', error);
    return { success: false, error: error.message };
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

// İlk çalıştırmada ve her dakikada bir geçmişi içe aktar
let isFirstRun = true;
async function autoImportHistory() {
  try {
    const result = await importBrowserHistories();
    if (result.success) {
      log.info(`Otomatik geçmiş içe aktarma başarılı. Eklenen: ${result.added}, Güncellenen: ${result.updated}`);
    } else {
      log.error('Otomatik geçmiş içe aktarma başarısız:', result.error);
    }
  } catch (error) {
    log.error('Otomatik geçmiş içe aktarma hatası:', error);
  }
  
  if (isFirstRun) {
    isFirstRun = false;
    // İlk çalıştırmadan sonra her dakikada bir çalıştır
    setInterval(autoImportHistory, 60000);
  }
}

// Otomatik güncelleme ayarları
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
  log.info('Güncellemeler kontrol ediliyor...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Güncelleme mevcut:', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Güncelleme mevcut değil:', info);
});

autoUpdater.on('error', (err) => {
  log.error('Güncelleme hatası:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `İndirme hızı: ${progressObj.bytesPerSecond}`;
  logMessage += ` - İndirilen: ${progressObj.percent}%`;
  logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
  log.info(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Güncelleme indirildi:', info);
  autoUpdater.quitAndInstall();
});

app.on('ready', () => {
  createWindow();
  autoImportHistory();

  // Global kısayol tuşu kaydet
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (isVisible) {
      mainWindow.hide();
      isVisible = false;
    } else {
      mainWindow.show();
      isVisible = true;
      mainWindow.webContents.send('show-window');
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
    const results = await searchHistory(searchTerm);
    event.reply('search-results', results);
  } catch (error) {
    console.error('Arama hatası:', error);
    event.reply('search-results', []);
  }
});

ipcMain.on('import-chrome-history', async (event) => {
  try {
    const result = await importBrowserHistories();
    event.reply('import-complete', result);
  } catch (error) {
    console.error('İçe aktarma hatası:', error);
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
    console.error('Geçmiş sıfırlama hatası:', error);
    return { success: false, error: error.message };
  }
}

ipcMain.on('reset-history', async (event) => {
  try {
    const result = await resetHistory();
    event.reply('reset-complete', result);
  } catch (error) {
    console.error('Sıfırlama hatası:', error);
    event.reply('reset-complete', { success: false, error: error.message });
  }
}); 