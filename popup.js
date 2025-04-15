// Tarayıcı API'sini belirle
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const urlCountElement = document.getElementById("url-count");

    function displayHistory(history) {
        resultsContainer.innerHTML = "";

        if (!history || history.length === 0) {
            urlCountElement.textContent = "Sonuç bulunamadı";
            return;
        }

        const urlCount = history.length;
        urlCountElement.textContent = `${urlCount} URL${urlCount !== 1 ? 's' : ''} found`;

        history.forEach(item => {
            const li = document.createElement("li");
            
            const link = document.createElement("a");
            link.href = item.url;
            link.textContent = item.title || item.url;
            link.target = "_blank";
            
            const urlSpan = document.createElement("span");
            urlSpan.textContent = item.url;
            
            const scoreSpan = document.createElement("span");
            scoreSpan.className = "score";
            scoreSpan.textContent = `Score: ${item.score.toFixed(2)}`;
            
            li.appendChild(link);
            li.appendChild(urlSpan);
            li.appendChild(scoreSpan);
            
            resultsContainer.appendChild(li);
        });
    }

    function searchHistory(query) {
        if (query.length < 2) {
            resultsContainer.innerHTML = "";
            urlCountElement.textContent = "En az 2 karakter giriniz";
            return;
        }

        browserAPI.storage.local.get({ savedHistory: [] }, (data) => {
            let savedHistory = data.savedHistory;
            savedHistory.sort((a, b) => b.score - a.score);

            const filteredHistory = savedHistory.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.url.toLowerCase().includes(query.toLowerCase())
            );
            displayHistory(filteredHistory);
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
