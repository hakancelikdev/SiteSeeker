# Fast History Search

Tarayıcı geçmişinizde hızlı arama yapmanızı sağlayan bir masaüstü uygulaması ve tarayıcı eklentisi.

## Özellikler

- 🚀 Hızlı ve anlık arama
- 📊 Ziyaret ve yazma sıklığına göre akıllı sıralama
- 🔄 Gerçek zamanlı geçmiş güncellemesi
- 🌐 Chrome, Firefox ve Safari uyumluluğu
- 🔍 Başlık ve URL'lerde arama
- 📱 macOS Sonoma tarzında modern arayüz
- ⌨️ Global kısayol tuşu desteği (⌘+⇧+Space)
- 🔄 Otomatik güncelleme sistemi
- 📊 İçe aktarma istatistikleri
- 🎨 Dinamik pencere boyutlandırma

## Kurulum

### Masaüstü Uygulaması

1. En son sürümü [Releases](https://github.com/hakancelikdev/FastHistorySearch/releases) sayfasından indirin
2. DMG dosyasını açın ve uygulamayı Applications klasörüne sürükleyin
3. İlk çalıştırmada Safari geçmişine erişim için "Tam Disk Erişimi" izni vermeniz gerekebilir:
   - Sistem Ayarları > Gizlilik ve Güvenlik > Tam Disk Erişimi
   - "Fast History Search" uygulamasını etkinleştirin

### Chrome Eklentisi

1. `extension` klasörünü Chrome'da `chrome://extensions/` adresine yükleyin
2. Geliştirici modunu aktif edin
3. "Paketlenmemiş öğe yükle" ile extension klasörünü seçin
4. Native messaging host'u kurmak için:
   ```bash
   cd extension
   chmod +x install_host.sh
   ./install_host.sh
   ```

## Kullanım

1. Uygulamayı başlatın
2. ⌘+⇧+Space kısayolunu kullanarak arama penceresini açın
3. Arama yapmak istediğiniz terimi girin
4. Sonuçlar otomatik olarak görüntülenecektir
5. Sonuçlar ziyaret sıklığı ve yazma sıklığına göre sıralanır
6. İstediğiniz sonuca tıklayarak ilgili sayfaya gidebilirsiniz
7. Geçmişi içe aktarmak için 🔄 butonunu kullanın
8. Geçmişi sıfırlamak için 🗑️ butonunu kullanın

## Teknik Detaylar

- Electron tabanlı masaüstü uygulaması
- Chrome Manifest V3 uyumlu eklenti
- Native messaging ile uygulama-eklenti iletişimi
- SQLite veritabanı entegrasyonu
- Akıllı puanlama sistemi
- Otomatik güncelleme sistemi
- Maksimum 10,000 kayıt depolama limiti
- electron-store ile yerel veri depolama
- Gerçek zamanlı geçmiş senkronizasyonu

## Gizlilik

- Tüm veriler yerel olarak saklanır
- Hiçbir veri harici sunuculara gönderilmez
- Sadece ziyaret edilen sayfaların başlık ve URL bilgileri kaydedilir
- Safari geçmişi için Tam Disk Erişimi gereklidir

## Geliştirme

```bash
# Depoyu klonlayın
git clone https://github.com/hakancelikdev/FastHistorySearch.git

# Dizine gidin
cd FastHistorySearch

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm start

# Uygulamayı paketleyin
npm run dist
```

## Dağıtım

```bash
# macOS için uygulama oluşturma
npm run dist

# Oluşturulan dosyalar dist/ klasöründe:
# - Fast History Search-1.0.0-arm64.dmg
# - Fast History Search-1.0.0-arm64-mac.zip
```

## Katkıda Bulunma

1. Bu depoyu forklayın
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

[MIT License](LICENSE)

## İletişim

Hakan Çelik - [@hakancelikdev](https://twitter.com/hakancelikdev)

Proje Linki: [https://github.com/hakancelikdev/FastHistorySearch](https://github.com/hakancelikdev/FastHistorySearch)
