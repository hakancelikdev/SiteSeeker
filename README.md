# Fast History Search

Tarayıcı geçmişinizde hızlı arama yapmanızı sağlayan bir tarayıcı eklentisi.

## Özellikler

- 🚀 Hızlı ve anlık arama
- 📊 Ziyaret ve yazma sıklığına göre akıllı sıralama
- 🔄 Gerçek zamanlı geçmiş güncellemesi
- 🌐 Chrome ve Firefox uyumluluğu
- 🔍 Başlık ve URL'lerde arama
- 📱 Kullanıcı dostu arayüz

## Kurulum

### Chrome

1. [Chrome Web Store](#) üzerinden eklentiyi yükleyin
2. Eklenti otomatik olarak aktif hale gelecektir
3. Sağ üst köşedeki eklenti ikonuna tıklayarak kullanmaya başlayabilirsiniz

### Firefox

1. [Firefox Add-ons](#) üzerinden eklentiyi yükleyin
2. Eklenti otomatik olarak aktif hale gelecektir
3. Sağ üst köşedeki eklenti ikonuna tıklayarak kullanmaya başlayabilirsiniz

## Kullanım

1. Eklenti ikonuna tıklayın
2. Arama kutusuna en az 2 karakter girin
3. Sonuçlar otomatik olarak görüntülenecektir
4. Sonuçlar ziyaret sıklığı ve yazma sıklığına göre sıralanır
5. İstediğiniz sonuca tıklayarak ilgili sayfaya gidebilirsiniz

## Teknik Detaylar

- Manifest V2 (Firefox) ve V3 (Chrome) uyumluluğu
- Tarayıcı geçmişi olaylarını (onVisited, onVisitRemoved) dinleyerek gerçek zamanlı güncelleme
- Yerel depolama kullanarak hızlı erişim
- Maksimum 10,000 kayıt depolama limiti
- Akıllı puanlama sistemi ile alakalı sonuçları önceliklendirme

## Gizlilik

- Tüm veriler yerel olarak saklanır
- Hiçbir veri harici sunuculara gönderilmez
- Sadece ziyaret edilen sayfaların başlık ve URL bilgileri kaydedilir

## Geliştirme

```bash
# Depoyu klonlayın
git clone https://github.com/hakancelikdev/FastHistorySearch.git

# Dizine gidin
cd FastHistorySearch

# Chrome için manifest dosyasını hazırlama
cp manifest.chrome.json manifest.json

# Geliştirme için Chrome'da yükleme:
1. Chrome'da chrome://extensions/ adresine gidin
2. Geliştirici modunu aktif edin
3. "Paketlenmemiş öğe yükle" ile proje klasörünü seçin

# Firefox için manifest dosyasını hazırlama
cp manifest.firefox.json manifest.json

# Geliştirme için Firefox'ta yükleme:
1. Firefox'ta about:debugging adresine gidin
2. "Bu Firefox" sekmesine tıklayın
3. "Geçici Eklenti Yükle" ile manifest.json dosyasını seçin
```

## Dağıtım

### Chrome Web Store için Hazırlama
```bash
cp manifest.chrome.json manifest.json
zip -r extension.zip * -x "manifest.firefox.json"
```

### Firefox Add-ons için Hazırlama
```bash
cp manifest.firefox.json manifest.json
zip -r extension.zip * -x "manifest.chrome.json"
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
