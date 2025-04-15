# SiteSeeker 🚀

Tarayıcı geçmişinizde anında arama yapın, zaman kazanın! Modern ve şık bir arayüz ile geçmişinize hızlıca erişin.

![SiteSeeker Banner](assets/banner.png)

## ✨ Neden SiteSeeker?

- **⚡️ Anında Arama**: Millisaniyeler içinde sonuçlar
- **🎯 Akıllı Sıralama**: En çok ziyaret ettiğiniz sayfalar her zaman üstte
- **🔍 Çoklu Tarayıcı Desteği**: Chrome, Firefox ve Safari geçmişinizi tek bir yerden arayın
- **⌨️ Global Kısayol**: ⌘+⇧+Space ile her yerden hızlıca erişin
- **🎨 Modern Tasarım**: macOS Sonoma tarzında şık ve modern arayüz
- **🔄 Gerçek Zamanlı**: Geçmiş güncellemelerini anında yakalar
- **🔒 Gizlilik Odaklı**: Tüm veriler sadece sizin bilgisayarınızda
- **📱 İki Kullanım Seçeneği**: İster masaüstü uygulaması, ister Chrome uzantısı olarak kullanın

## 🛠 Geliştirme

### 📦 Build Alma

#### Gereksinimler
- Node.js ve npm yüklü olmalı

#### Chrome ve Firefox için Build
1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/hakancelikdev/SiteSeeker.git
   cd SiteSeeker
   ```

2. Build alın:
   ```bash
   # dist dizinini temizle ve yeni dizinleri oluştur
   rm -rf dist && mkdir -p dist/chrome dist/firefox

   # Chrome için dosyaları kopyala
   cp background.js popup.js popup.html icon.png dist/chrome/
   cp manifest.chrome.json dist/chrome/manifest.json

   # Firefox için dosyaları kopyala
   cp background.js popup.js popup.html icon.png dist/firefox/
   cp manifest.firefox.json dist/firefox/manifest.json

   # ZIP dosyalarını oluştur
   cd dist/chrome && zip -r ../siteseeker-chrome.zip .
   cd ../firefox && zip -r ../siteseeker-firefox.zip .
   ```

3. Build çıktıları:
   - Chrome: `dist/siteseeker-chrome.zip`
   - Firefox: `dist/siteseeker-firefox.zip`

#### Eklentiyi Test Etme

##### Chrome için:
1. `chrome://extensions/` adresine gidin
2. Sağ üstteki "Geliştirici modu"nu açın
3. Seçenekler:
   - `dist/siteseeker-chrome.zip` dosyasını sayfaya sürükleyip bırakın
   - veya "Paketlenmemiş öğe yükle" ile `dist/chrome` dizinini seçin

##### Firefox için:
1. `about:debugging` adresine gidin
2. "Bu Firefox" sekmesine tıklayın
3. "Geçici Eklenti Yükle" ile `dist/firefox/manifest.json` dosyasını seçin

## 🎬 Hızlı Başlangıç

### 💻 Masaüstü Uygulaması Olarak

1. [Releases](https://github.com/hakancelikdev/SiteSeeker/releases) sayfasından son sürümü indirin
2. DMG dosyasını açın ve uygulamayı yükleyin
3. ⌘+⇧+Space kısayolu ile her yerden erişin!

### 🔌 Chrome Uzantısı Olarak

1. Chrome Web Store'dan "SiteSeeker" uzantısını yükleyin
2. Tarayıcı çubuğundaki ikona tıklayarak kullanmaya başlayın

## 🌟 Öne Çıkan Özellikler

### 🎯 Akıllı Arama Algoritması
- Ziyaret sıklığına göre akıllı sıralama
- URL ve başlıklarda anında arama
- Yazım hatalarına karşı toleranslı

### 🎨 Modern ve Şık Arayüz
- macOS Sonoma tarzında tasarım
- Dinamik pencere boyutlandırma
- Pürüzsüz animasyonlar
- Koyu mod desteği

### ⚡️ Performans Odaklı
- Millisaniyeler içinde sonuçlar
- Düşük sistem kaynağı kullanımı
- Arka planda minimum etki

### 🔒 Gizlilik ve Güvenlik
- Veriler sadece yerel cihazınızda
- Hiçbir veri paylaşımı yok
- Açık kaynak kod

## 📊 Kullanıcı Deneyimi

- **Hızlı Erişim**: Global kısayol ile her yerden anında erişim
- **Kolay Kullanım**: Sezgisel arayüz, minimum öğrenme eğrisi
- **Akıllı Sonuçlar**: En çok kullandığınız sayfalar her zaman üstte
- **İstatistikler**: İçe aktarılan ve taranan geçmiş sayısını görün

## 🛠 Teknik Özellikler

- **Electron Tabanlı**: Modern ve hızlı masaüstü uygulaması
- **Chrome Manifest V3**: En son teknoloji uzantı desteği
- **SQLite Entegrasyonu**: Hızlı ve güvenilir veri depolama
- **Otomatik Güncelleme**: Her zaman en son sürüme sahip olun

## 🤝 Topluluk ve Destek

- [GitHub Issues](https://github.com/hakancelikdev/SiteSeeker/issues): Hata raporları ve öneriler
- [Twitter](https://twitter.com/hakancelikdev): Güncellemeler ve duyurular
- [GitHub Discussions](https://github.com/hakancelikdev/SiteSeeker/discussions): Topluluk tartışmaları

## 📝 Lisans

[GNU General Public License v3.0](LICENSE) - Bu yazılım özgür bir yazılımdır. Herkes bu yazılımı kopyalayabilir, dağıtabilir ve/veya değiştirebilir.

## 👨‍💻 Geliştirici

Hakan Çelik ([@hakancelikdev](https://twitter.com/hakancelikdev))

---

⭐️ Eğer SiteSeeker'ı beğendiyseniz, yıldız vermeyi unutmayın!
