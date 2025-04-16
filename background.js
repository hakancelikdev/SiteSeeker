// Debug modu
const DEBUG = true;

const INITIAL_SCORE = 1;
// Her seferde işlenecek maksimum kayıt sayısı - Limitsiz için 0 veya çok yüksek bir değer
const BATCH_SIZE = 100000; // Çok daha yüksek bir limit

// Tarayıcı API'sini belirle
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Debug log yardımcı fonksiyonu
function debugLog(message, data = null) {
    if (DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
        if (data) {
            console.log('Data:', data);
        }
    }
}

// Storage'a kaydetme işlemini wrap eden yardımcı fonksiyon
async function saveToStorage(savedHistory) {
    try {
        debugLog(`Saving ${savedHistory.length} items to storage`);
        const startTime = performance.now();
        await browserAPI.storage.local.set({ savedHistory });
        const duration = (performance.now() - startTime).toFixed(2);
        debugLog(`Storage save completed in ${duration}ms`);
    } catch (error) {
        console.error('Storage error:', error);
        debugLog('Failed items:', savedHistory.slice(0, 5)); // İlk 5 item'ı göster
    }
}

// Bookmark'ları işle ve kaydet
async function processBookmarks(bookmarkNode) {
    let bookmarks = [];
    let totalBookmarks = 0;
    let errorCount = 0;
    
    function traverseBookmarks(node) {
        try {
            if (node.url) {
                totalBookmarks++;
                bookmarks.push({
                    url: node.url,
                    title: node.title || 'Untitled Bookmark',
                    score: INITIAL_SCORE,
                    lastVisitTime: Date.now(),
                    isBookmark: true
                });
            }
            if (node.children) {
                for (const child of node.children) {
                    traverseBookmarks(child);
                }
            }
        } catch (error) {
            errorCount++;
            debugLog(`Error processing bookmark: ${error.message}`, node);
        }
    }
    
    debugLog('Starting bookmark processing...');
    traverseBookmarks(bookmarkNode);
    debugLog(`Bookmark processing completed:
    - Total found: ${totalBookmarks}
    - Successfully processed: ${bookmarks.length}
    - Errors: ${errorCount}`);
    
    return bookmarks;
}

// Bookmark'ları güncelle
async function updateBookmarks() {
    try {
        const bookmarkTree = await browserAPI.bookmarks.getTree();
        const bookmarks = await processBookmarks(bookmarkTree[0]);
        
        const data = await browserAPI.storage.local.get({ savedHistory: [] });
        let savedHistory = data.savedHistory || [];
        
        // Mevcut bookmark'ları kaldır
        const oldBookmarkCount = savedHistory.filter(item => item.isBookmark).length;
        savedHistory = savedHistory.filter(item => !item.isBookmark);
        
        // Yeni bookmark'ları ekle
        savedHistory = savedHistory.concat(bookmarks);
        
        // Skorlarına göre sırala ve kaydet
        savedHistory.sort((a, b) => b.score - a.score);
        await saveToStorage(savedHistory);
        
        console.log(`Bookmarks updated: ${bookmarks.length} items (removed ${oldBookmarkCount} old bookmarks)`);
    } catch (error) {
        console.error('Error updating bookmarks:', error);
    }
}

// Tekil URL ziyaretlerini işle
browserAPI.history.onVisited.addListener(async (historyItem) => {
    try {
        if (!historyItem.title) {
            return;
        }

        const data = await browserAPI.storage.local.get({ savedHistory: [] });
        let savedHistory = data.savedHistory || [];
        let existingItem = savedHistory.find(item => item.url === historyItem.url);

        if (existingItem) {
            // Mevcut kayıt varsa skoru artır
            if (!existingItem.isBookmark) { // Bookmark değilse skoru güncelle
                existingItem.score += 1;
                existingItem.lastVisitTime = historyItem.lastVisitTime;
            }
            console.log("Score increased for existing item:", historyItem.url);
        } else {
            // Yeni kayıt ekle
            savedHistory.push({
                url: historyItem.url,
                title: historyItem.title,
                score: INITIAL_SCORE,
                lastVisitTime: historyItem.lastVisitTime,
                isBookmark: false
            });
            console.log("New item added:", historyItem.url);
        }

        await saveToStorage(savedHistory);
    } catch (error) {
        console.error('Error in onVisited handler:', error);
    }
});

// Silinen geçmiş kayıtlarını işle
browserAPI.history.onVisitRemoved.addListener(async (removed) => {
    try {
        if (removed.allHistory) {
            // Tüm geçmiş silindiyse, sadece bookmark'ları koru
            const data = await browserAPI.storage.local.get({ savedHistory: [] });
            let savedHistory = data.savedHistory || [];
            savedHistory = savedHistory.filter(item => item.isBookmark);
            await saveToStorage(savedHistory);
            console.log("All history cleared, bookmarks preserved");
            return;
        }

        // Belirli URL'ler silindiyse
        const data = await browserAPI.storage.local.get({ savedHistory: [] });
        let savedHistory = data.savedHistory || [];
        let updatedHistory = savedHistory.filter(item => 
            item.isBookmark || !removed.urls.includes(item.url)
        );
        
        await saveToStorage(updatedHistory);
        console.log("Removed items:", removed.urls);
    } catch (error) {
        console.error('Error in onVisitRemoved handler:', error);
    }
});

// Bookmark değişikliklerini dinle
browserAPI.bookmarks.onCreated.addListener(() => updateBookmarks());
browserAPI.bookmarks.onRemoved.addListener(() => updateBookmarks());
browserAPI.bookmarks.onChanged.addListener(() => updateBookmarks());
browserAPI.bookmarks.onMoved.addListener(() => updateBookmarks());

// Geçmiş verilerini işle
async function processHistoryBatch(startTime, endTime) {
    try {
        debugLog(`Processing history from ${new Date(startTime)} to ${new Date(endTime)}`);
        
        const timeChunkSize = 30 * 24 * 60 * 60 * 1000; // 30 günlük dilimler
        let currentStartTime = startTime;
        let allResults = [];
        let processedChunks = 0;
        let errorChunks = 0;

        while (currentStartTime < endTime) {
            const chunkEndTime = Math.min(currentStartTime + timeChunkSize, endTime);
            processedChunks++;
            
            try {
                debugLog(`Requesting chunk ${processedChunks}: ${new Date(currentStartTime)} to ${new Date(chunkEndTime)}`);
                const chunkStartTime = performance.now();
                
                const results = await browserAPI.history.search({
                    text: "",
                    startTime: currentStartTime,
                    endTime: chunkEndTime,
                    maxResults: BATCH_SIZE
                });

                const chunkDuration = (performance.now() - chunkStartTime).toFixed(2);
                debugLog(`Chunk ${processedChunks} completed in ${chunkDuration}ms:
                - Items received: ${results.length}
                - Items with title: ${results.filter(item => item.title).length}
                - Unique URLs: ${new Set(results.map(item => item.url)).size}`);
                
                allResults = allResults.concat(results);
            } catch (error) {
                errorChunks++;
                console.error(`Error processing chunk ${processedChunks}:`, error);
            }
            
            currentStartTime = chunkEndTime;
        }

        debugLog(`History processing summary:
        - Total chunks processed: ${processedChunks}
        - Failed chunks: ${errorChunks}
        - Total items: ${allResults.length}`);

        const processedResults = allResults
            .filter(item => item.title)
            .map(item => ({
                url: item.url,
                title: item.title,
                score: INITIAL_SCORE + item.visitCount + (item.typedCount || 0),
                lastVisitTime: item.lastVisitTime,
                isBookmark: false
            }));

        debugLog(`Final processed results: ${processedResults.length} items`);
        return processedResults;
    } catch (error) {
        console.error('Error in history batch processing:', error);
        return [];
    }
}

// İlk kurulumda geçmişi indexle
async function initializeHistory() {
    try {
        debugLog('Starting initial history indexing...');
        const startTime = performance.now();
        
        const endTime = Date.now();
        const historyStartTime = endTime - (5 * 365 * 24 * 60 * 60 * 1000);
        
        debugLog('Processing history...');
        const allHistory = await processHistoryBatch(historyStartTime, endTime);
        
        debugLog('Processing bookmarks...');
        const bookmarkTree = await browserAPI.bookmarks.getTree();
        const bookmarks = await processBookmarks(bookmarkTree[0]);
        
        const combinedHistory = allHistory.concat(bookmarks);
        debugLog(`Sorting ${combinedHistory.length} total items...`);
        
        combinedHistory.sort((a, b) => b.score - a.score);
        await saveToStorage(combinedHistory);
        
        const duration = (performance.now() - startTime).toFixed(2);
        debugLog(`Initialization completed in ${duration}ms:
        - History items: ${allHistory.length}
        - Bookmarks: ${bookmarks.length}
        - Total items: ${combinedHistory.length}`);
    } catch (error) {
        console.error('Error in initialization:', error);
        debugLog('Initialization failed', error);
    }
}

// Sadece ilk kurulumda çalıştır
browserAPI.runtime.onInstalled.addListener(() => {
    initializeHistory();
});
