# Mac App Store'a Yükleme Rehberi

Bu rehber, SiteSeeker uygulamasını Mac App Store'a yüklemek için gerekli adımları içerir.

## Ön Gereksinimler

1. **Apple Developer Program** üyeliği (yıllık $99)
2. **Xcode** yüklü olmalı
3. **App Store Connect** hesabı
4. **Code Signing Certificate** (Mac App Distribution)
5. **Provisioning Profile** (Mac App Store)

## Adım 1: Apple Developer Hesabı Ayarları

### 1.1 Certificate Oluşturma
1. [Apple Developer Portal](https://developer.apple.com/account/)'a giriş yapın
2. **Certificates, Identifiers & Profiles** > **Certificates** > **+**
3. **Mac App Distribution** sertifikası oluşturun
4. Sertifikayı indirin ve Keychain'e yükleyin

### 1.2 App ID Oluşturma
1. **Identifiers** > **App IDs** > **+**
2. **App** seçin
3. Bundle ID: `com.hakancelikdev.siteseeker`
4. **Mac App Store** capability'sini etkinleştirin

### 1.3 Provisioning Profile Oluşturma
1. **Profiles** > **+**
2. **Mac App Store** seçin
3. App ID'yi seçin
4. Sertifikayı seçin
5. Profile'ı indirin ve `build/embedded.provisionprofile` olarak kaydedin

## Adım 2: Environment Variables Ayarlama

`env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:

```bash
# Apple Developer Account Information
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=your-team-id

# Code Signing Identity (optional, will use default if not set)
APPLE_IDENTITY=Developer ID Application: Your Name

# Certificate file (optional, if using .p12 file)
CSC_LINK=path/to/your/certificate.p12
CSC_KEY_PASSWORD=your-certificate-password

# Build target (set to 'mas' for Mac App Store)
BUILD_TARGET=mas
```

**Not:** App-specific password oluşturmak için:
1. [Apple ID](https://appleid.apple.com/) sayfasına gidin
2. **Sign-in and Security** > **App-specific passwords**
3. Yeni bir app-specific password oluşturun

## Adım 3: Dependencies Yükleme

```bash
npm install
```

## Adım 4: Icon Dönüştürme

```bash
./scripts/convert-icon.sh
```

## Adım 5: Mac App Store Build

```bash
# Dependencies'ları yükleyin
npm install

# Mac App Store için build ve signing
npm run build:signed:mas
```

**Alternatif olarak manuel build:**
```bash
# 1. Build the app
npm run build:mas

# 2. Sign the built app
npm run sign:mas ./dist/SiteSeeker-1.2.6-universal-mas.app

# 3. Notarize (otomatik olarak afterSign hook ile çalışır)
```

## Adım 6: App Store Connect'e Yükleme

### 6.1 App Store Connect'te App Oluşturma
1. [App Store Connect](https://appstoreconnect.apple.com/)'e giriş yapın
2. **My Apps** > **+** > **New App**
3. Platform: **macOS**
4. Bundle ID: `com.hakancelikdev.siteseeker`
5. SKU: `siteseeker-mac`
6. App Name: **SiteSeeker**

### 6.2 App Bilgilerini Doldurma
1. **App Information** sekmesinde:
   - Description
   - Keywords
   - Support URL
   - Marketing URL (opsiyonel)
   - Privacy Policy URL

2. **Pricing and Availability** sekmesinde:
   - Price
   - Availability

3. **App Review Information** sekmesinde:
   - Contact Information
   - Demo Account (gerekirse)
   - Notes

### 6.3 Screenshots ve Metadata
1. **Screenshots** sekmesinde:
   - 1280x800 minimum boyutunda screenshots
   - En az 1 screenshot gerekli

2. **App Store** sekmesinde:
   - App icon (1024x1024 PNG)
   - App preview videos (opsiyonel)

## Adım 7: Build Yükleme

### 7.1 Xcode ile Yükleme
1. Xcode'u açın
2. **Product** > **Archive**
3. **Distribute App** > **App Store Connect**
4. **Upload** seçin
5. Sertifika ve provisioning profile'ı seçin

### 7.2 Terminal ile Yükleme
```bash
# Build'i App Store Connect'e yükleyin
xcrun altool --upload-app --type macos --file "dist/mas-universal/SiteSeeker-1.2.6-universal-mas.pkg" --username "your-apple-id@example.com" --password "your-app-specific-password"
```

## Adım 8: App Review

1. App Store Connect'te **TestFlight** sekmesine gidin
2. Build'i **Submit for Review** yapın
3. Review süreci 1-7 gün sürebilir

## Önemli Notlar

### Sandboxing
Mac App Store uygulamaları sandboxed olmalıdır. Uygulama şu izinleri kullanır:
- `com.apple.security.files.user-selected.read-only`: Kullanıcının seçtiği dosyaları okuma
- `com.apple.security.files.downloads.read-write`: Downloads klasörüne erişim
- `com.apple.security.network.client`: Ağ erişimi

### Hardened Runtime
Mac App Store uygulamaları Hardened Runtime kullanmalıdır. Bu otomatik olarak etkinleştirilmiştir.

### Notarization
Build otomatik olarak notarize edilir. Bu işlem Apple'ın güvenlik kontrolünden geçer.

## Sorun Giderme

### Code Signing Hataları
```bash
# Sertifika listesini kontrol edin
security find-identity -v -p codesigning

# Keychain'i temizleyin
security delete-certificate -c "Apple Development"
```

### Build Hataları
```bash
# Clean build
npm run clean
npm install
npm run build:signed:mas
```

### Notarization Hataları
```bash
# Notarization durumunu kontrol edin
xcrun altool --notarization-info [UUID] --username "your-apple-id@example.com" --password "your-app-specific-password"
```

## Faydalı Linkler

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Mac App Store Programming Guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/) 