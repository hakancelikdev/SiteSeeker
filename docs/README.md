# SiteSeeker GitHub Pages

Bu klasör SiteSeeker projesinin GitHub Pages web sitesini içerir.

## Yapı

- `index.html` - Ana sayfa
- `styles.css` - CSS stilleri
- `script.js` - JavaScript fonksiyonları
- `assets/` - Resim dosyaları ve diğer medya

## Build Süreci

GitHub Pages otomatik olarak `docs` klasörünü kullanır. Herhangi bir build işlemi gerekmez.

## Gerekli Dosyalar

Tüm gerekli resim dosyaları `assets/` klasöründe bulunmalıdır:

- `logo.png` - SiteSeeker logosu
- `favicon.png` - Site favicon'u
- `hero-app.png` - Ana uygulama ekran görüntüsü
- `og-image.png` - Sosyal medya paylaşım resmi
- `install-step.png` - Kurulum adımı
- `permissions-step.png` - İzin adımı
- `search-step.png` - Arama adımı
- `advanced-step.png` - Gelişmiş özellikler adımı
- `developer-avatar.png` - Geliştirici profil resmi

## Deployment

GitHub Actions workflow'u (`deploy.yml`) otomatik olarak:

1. `main` branch'e push yapıldığında tetiklenir
2. `docs/` klasöründeki değişiklikleri algılar
3. GitHub Pages'e deploy eder

## Local Test

Local'de test etmek için:

```bash
cd docs
python3 -m http.server 8080
```

Sonra `http://localhost:8080` adresini ziyaret edin.
