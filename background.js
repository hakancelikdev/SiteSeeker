const INITIAL_SCORE = 1;
const MAX_ITEMS = 10000; // Maksimum kayıt sayısı limiti
const BATCH_SIZE = 1000; // Her seferde işlenecek maksimum kayıt sayısı

// Tarayıcı API'sini belirle
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Storage'a kaydetme işlemini wrap eden yardımcı fonksiyon
async function saveToStorage(savedHistory) {
    try {
        // En yüksek skorlu kayıtları tut
        if (savedHistory.length > MAX_ITEMS) {
            savedHistory.sort((a, b) => b.score - a.score);
            savedHistory = savedHistory.slice(0, MAX_ITEMS);
        }

        await browserAPI.storage.local.set({ savedHistory });
    } catch (error) {
        console.error('Storage error:', error);
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
            existingItem.score += 1;
            existingItem.lastVisitTime = historyItem.lastVisitTime;
            console.log("Score increased for existing item:", historyItem.url);
        } else {
            // Yeni kayıt ekle
            savedHistory.push({
                url: historyItem.url,
                title: historyItem.title,
                score: INITIAL_SCORE,
                lastVisitTime: historyItem.lastVisitTime
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
            // Tüm geçmiş silindiyse, indexi de temizle
            await browserAPI.storage.local.set({ savedHistory: [] });
            console.log("All history cleared");
            return;
        }

        // Belirli URL'ler silindiyse
        const data = await browserAPI.storage.local.get({ savedHistory: [] });
        let savedHistory = data.savedHistory || [];
        let updatedHistory = savedHistory.filter(item => 
            !removed.urls.includes(item.url)
        );
        
        await saveToStorage(updatedHistory);
        console.log("Removed items:", removed.urls);
    } catch (error) {
        console.error('Error in onVisitRemoved handler:', error);
    }
});

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
                lastVisitTime: item.lastVisitTime
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
