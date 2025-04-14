const INITIAL_SCORE = 1;
const MAX_ITEMS = 10000; // Maksimum kayıt sayısı limiti

// Storage'a kaydetme işlemini wrap eden yardımcı fonksiyon
async function saveToStorage(savedHistory) {
    try {
        // En yüksek skorlu kayıtları tut
        if (savedHistory.length > MAX_ITEMS) {
            savedHistory.sort((a, b) => b.score - a.score);
            savedHistory = savedHistory.slice(0, MAX_ITEMS);
        }

        await chrome.storage.local.set({ savedHistory });
    } catch (error) {
        console.error('Storage error:', error);
    }
}

// Tekil URL ziyaretlerini işle
chrome.history.onVisited.addListener(async (historyItem) => {
    try {
        if (!historyItem.title) {
            return;
        }

        const data = await chrome.storage.local.get({ savedHistory: [] });
        let savedHistory = data.savedHistory || [];
        let existingItem = savedHistory.find(item => item.url === historyItem.url);

        if (existingItem) {
            // Mevcut kayıt varsa skoru artır
            existingItem.score += 1;
            console.log("Score increased for existing item:", historyItem.url);
        } else {
            // Yeni kayıt ekle
            savedHistory.push({
                url: historyItem.url,
                title: historyItem.title,
                score: INITIAL_SCORE
            });
            console.log("New item added:", historyItem.url);
        }

        await saveToStorage(savedHistory);
    } catch (error) {
        console.error('Error in onVisited handler:', error);
    }
});

// Silinen geçmiş kayıtlarını işle
chrome.history.onVisitRemoved.addListener(async (removed) => {
    try {
        if (removed.allHistory) {
            // Tüm geçmiş silindiyse, indexi de temizle
            await chrome.storage.local.set({ savedHistory: [] });
            console.log("All history cleared");
            return;
        }

        // Belirli URL'ler silindiyse
        const data = await chrome.storage.local.get({ savedHistory: [] });
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

// İlk kurulumda geçmişi indexle
async function initializeHistory() {
    try {
        console.log("Initializing history index...");
        const results = await chrome.history.search({ 
            text: "", 
            startTime: 1, 
            maxResults: MAX_ITEMS 
        });

        const savedHistory = results
            .filter(item => item.title)
            .map(item => ({
                url: item.url,
                title: item.title,
                score: INITIAL_SCORE + (item.visitCount + item.typedCount)
            }));

        await saveToStorage(savedHistory);
        console.log(`Initial indexing completed with ${savedHistory.length} items`);
    } catch (error) {
        console.error('Error in initialization:', error);
    }
}

// Sadece ilk kurulumda çalıştır
chrome.runtime.onInstalled.addListener(() => {
    initializeHistory();
});
