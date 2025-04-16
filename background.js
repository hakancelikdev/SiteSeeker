const INITIAL_SCORE = 1;
const BOOKMARK_SCORE_BONUS = 5; // Bookmark'lar için ekstra skor
// Her seferde işlenecek maksimum kayıt sayısı
const BATCH_SIZE = 1000;

// Tarayıcı API'sini belirle
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Storage'a kaydetme işlemini wrap eden yardımcı fonksiyon
async function saveToStorage(savedHistory) {
    try {
        await browserAPI.storage.local.set({ savedHistory });
    } catch (error) {
        console.error('Storage error:', error);
    }
}

// Bookmark'ları işle ve kaydet
async function processBookmarks(bookmarkNode) {
    let bookmarks = [];
    
    function traverseBookmarks(node) {
        if (node.url) {
            bookmarks.push({
                url: node.url,
                title: node.title,
                score: INITIAL_SCORE + BOOKMARK_SCORE_BONUS,
                lastVisitTime: Date.now(),
                isBookmark: true
            });
        }
        if (node.children) {
            for (const child of node.children) {
                traverseBookmarks(child);
            }
        }
    }
    
    traverseBookmarks(bookmarkNode);
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
        savedHistory = savedHistory.filter(item => !item.isBookmark);
        
        // Yeni bookmark'ları ekle
        savedHistory = savedHistory.concat(bookmarks);
        
        // Skorlarına göre sırala ve kaydet
        savedHistory.sort((a, b) => b.score - a.score);
        await saveToStorage(savedHistory);
        
        console.log(`Bookmarks updated: ${bookmarks.length} items`);
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

// Geçmiş verilerini toplu olarak işle
async function processHistoryBatch(startTime, endTime) {
    try {
        const results = await browserAPI.history.search({
            text: "",
            startTime: startTime,
            endTime: endTime,
            maxResults: BATCH_SIZE
        });

        return results
            .filter(item => item.title)
            .map(item => ({
                url: item.url,
                title: item.title,
                score: INITIAL_SCORE + item.visitCount + (item.typedCount || 0),
                lastVisitTime: item.lastVisitTime,
                isBookmark: false
            }));
    } catch (error) {
        console.error('Error processing history batch:', error);
        return [];
    }
}

// İlk kurulumda geçmişi indexle
async function initializeHistory() {
    try {
        console.log("Initializing history index...");
        
        // Son 5 yıllık geçmişi al
        const endTime = Date.now();
        const startTime = endTime - (5 * 365 * 24 * 60 * 60 * 1000); // 5 yıl öncesi
        
        let allHistory = [];
        let currentStartTime = startTime;
        const timeIncrement = 30 * 24 * 60 * 60 * 1000; // 30 günlük dilimler
        
        while (currentStartTime < endTime) {
            const batchEndTime = Math.min(currentStartTime + timeIncrement, endTime);
            console.log(`Processing history from ${new Date(currentStartTime)} to ${new Date(batchEndTime)}`);
            
            const batchResults = await processHistoryBatch(currentStartTime, batchEndTime);
            allHistory = allHistory.concat(batchResults);
            
            // URL bazında birleştir ve en son ziyaret zamanını koru
            const urlMap = new Map();
            allHistory.forEach(item => {
                const existing = urlMap.get(item.url);
                if (!existing || existing.lastVisitTime < item.lastVisitTime) {
                    urlMap.set(item.url, item);
                }
            });
            
            allHistory = Array.from(urlMap.values());
            currentStartTime = batchEndTime;
        }

        // Bookmark'ları ekle
        const bookmarkTree = await browserAPI.bookmarks.getTree();
        const bookmarks = await processBookmarks(bookmarkTree[0]);
        allHistory = allHistory.concat(bookmarks);

        // Skorlarına göre sırala ve kaydet
        allHistory.sort((a, b) => b.score - a.score);
        await saveToStorage(allHistory);
        
        console.log(`Initial indexing completed with ${allHistory.length} items`);
    } catch (error) {
        console.error('Error in initialization:', error);
    }
}

// Sadece ilk kurulumda çalıştır
browserAPI.runtime.onInstalled.addListener(() => {
    initializeHistory();
});
