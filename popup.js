// Tarayıcı API'sini belirle
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Pagination sabitleri
const ITEMS_PER_PAGE = 50;
let currentPage = 1;
let isLoading = false;
let allResults = [];

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const urlCountElement = document.getElementById("url-count");
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loading";
    loadingIndicator.style.display = "none";
    loadingIndicator.textContent = "Yükleniyor...";
    document.body.appendChild(loadingIndicator);

    function displayHistory(results, append = false) {
        if (!append) {
            resultsContainer.innerHTML = "";
        }

        if (!results || results.length === 0) {
            if (!append) {
                urlCountElement.textContent = "Sonuç bulunamadı";
            }
            return;
        }

        if (!append) {
            urlCountElement.textContent = `${allResults.length} URL${allResults.length !== 1 ? 's' : ''} found`;
        }

        results.forEach(item => {
            const li = document.createElement("li");
            li.className = "result-item";
            
            const link = document.createElement("a");
            link.href = item.url;
            link.textContent = item.title || item.url;
            link.target = "_blank";
            
            const urlSpan = document.createElement("span");
            urlSpan.textContent = item.url;
            urlSpan.className = "url";
            
            const scoreSpan = document.createElement("span");
            scoreSpan.className = "score";
            scoreSpan.textContent = `Score: ${item.score.toFixed(2)}`;

            const leftSection = document.createElement("div");
            leftSection.className = "left-section";
            leftSection.appendChild(link);
            leftSection.appendChild(urlSpan);

            const rightSection = document.createElement("div");
            rightSection.className = "right-section";
            
            if (item.isBookmark) {
                const starIcon = document.createElement("span");
                starIcon.className = "star-icon";
                starIcon.innerHTML = "⭐";
                starIcon.title = "Bookmarked";
                rightSection.appendChild(starIcon);
            }
            
            rightSection.appendChild(scoreSpan);
            
            li.appendChild(leftSection);
            li.appendChild(rightSection);
            
            resultsContainer.appendChild(li);
        });
    }

    function loadMoreResults() {
        if (isLoading) return;
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const nextPageResults = allResults.slice(startIndex, endIndex);
        
        if (nextPageResults.length > 0) {
            displayHistory(nextPageResults, true);
            currentPage++;
        }
    }

    // Infinite scroll için scroll event listener
    resultsContainer.addEventListener("scroll", () => {
        if (isLoading) return;

        const scrollHeight = resultsContainer.scrollHeight;
        const scrollTop = resultsContainer.scrollTop;
        const clientHeight = resultsContainer.clientHeight;

        // Sayfa sonuna yaklaşıldığında yeni içerik yükle
        if (scrollHeight - scrollTop - clientHeight < 100) {
            loadMoreResults();
        }
    });

    function searchHistory(query) {
        if (query.length < 2) {
            resultsContainer.innerHTML = "";
            urlCountElement.textContent = "En az 2 karakter giriniz";
            return;
        }

        isLoading = true;
        loadingIndicator.style.display = "block";
        currentPage = 1;

        browserAPI.storage.local.get({ savedHistory: [] }, (data) => {
            let savedHistory = data.savedHistory;
            const searchTerm = query.toLowerCase();
            
            // Sonuçları filtrele ve eşleşme skorlarını hesapla
            allResults = savedHistory.filter(item => {
                const titleMatch = item.title.toLowerCase().includes(searchTerm);
                const urlMatch = item.url.toLowerCase().includes(searchTerm);
                return titleMatch || urlMatch;
            }).map(item => {
                const titleMatchIndex = item.title.toLowerCase().indexOf(searchTerm);
                const urlMatchIndex = item.url.toLowerCase().indexOf(searchTerm);
                
                const matchQuality = Math.min(
                    titleMatchIndex === -1 ? Infinity : titleMatchIndex,
                    urlMatchIndex === -1 ? Infinity : urlMatchIndex
                );
                
                return {
                    ...item,
                    matchQuality
                };
            });
            
            // Sıralama
            allResults.sort((a, b) => {
                if (a.isBookmark && !b.isBookmark) return -1;
                if (!a.isBookmark && b.isBookmark) return 1;
                
                if (a.isBookmark && b.isBookmark) {
                    if (a.matchQuality !== b.matchQuality) {
                        return a.matchQuality - b.matchQuality;
                    }
                    return b.score - a.score;
                }
                
                if (a.matchQuality !== b.matchQuality) {
                    return a.matchQuality - b.matchQuality;
                }
                return b.score - a.score;
            });
            
            // İlk sayfayı göster
            const initialResults = allResults.slice(0, ITEMS_PER_PAGE);
            displayHistory(initialResults);
            
            isLoading = false;
            loadingIndicator.style.display = "none";
        });
    }

    // Sayfa ilk yüklendiğinde sonuçları gösterme
    resultsContainer.innerHTML = "";
    urlCountElement.textContent = "Arama yapmak için en az 2 karakter giriniz";

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        searchHistory(query);
    });
});
