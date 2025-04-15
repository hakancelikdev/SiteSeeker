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

        urlCountElement.textContent = `${history.length} kayıt arasından ${history.length} sonuç bulundu.`;

        history.forEach(item => {
            const listItem = document.createElement("li");

            // Başlık linki
            const titleLink = document.createElement("a");
            titleLink.textContent = item.title;
            titleLink.href = item.url;
            titleLink.target = "_blank";

            // URL bilgisi
            const urlSpan = document.createElement("span");
            urlSpan.textContent = item.url;
            urlSpan.style.display = "block";
            urlSpan.style.wordBreak = "break-all";

            // Skor bilgisi
            const scoreSpan = document.createElement("span");
            scoreSpan.textContent = `Skor: ${item.score.toFixed(2)}`;
            scoreSpan.className = "score";

            listItem.appendChild(titleLink);
            listItem.appendChild(urlSpan);
            listItem.appendChild(scoreSpan);
            resultsContainer.appendChild(listItem);
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
