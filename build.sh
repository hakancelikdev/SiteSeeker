#!/bin/bash

# Renkli çıktı için fonksiyonlar
print_info() {
    echo -e "\033[1;34m➡️ $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# Dizin temizleme
print_info "Dist dizini temizleniyor..."
rm -rf dist
mkdir -p dist/chrome dist/firefox

# Browser extensions için build
build_extensions() {
    print_info "Browser extensions build işlemi başlatılıyor..."
    
    # Chrome için dosyaları kopyala
    print_info "Chrome extension hazırlanıyor..."
    cp background.js popup.js popup.html icon.png dist/chrome/
    cp manifest.chrome.json dist/chrome/manifest.json
    cd dist/chrome && zip -r ../siteseeker-chrome.zip . > /dev/null
    cd ../..
    print_success "Chrome extension build tamamlandı: dist/siteseeker-chrome.zip"
    
    # Firefox için dosyaları kopyala
    print_info "Firefox extension hazırlanıyor..."
    cp background.js popup.js popup.html icon.png dist/firefox/
    cp manifest.firefox.json dist/firefox/manifest.json
    cd dist/firefox && zip -r ../siteseeker-firefox.zip . > /dev/null
    cd ../..
    print_success "Firefox extension build tamamlandı: dist/siteseeker-firefox.zip"
}

# macOS app için build
build_macos() {
    print_info "macOS uygulaması build işlemi başlatılıyor..."
    npm install
    npm run build
    if [ $? -eq 0 ]; then
        print_success "macOS uygulaması build tamamlandı"
    else
        print_error "macOS uygulaması build işleminde hata oluştu!"
        exit 1
    fi
}

# Ana build işlemi
case "$1" in
    "extensions")
        build_extensions
        ;;
    "macos")
        build_macos
        ;;
    "all")
        build_extensions
        build_macos
        ;;
    *)
        echo "Kullanım: ./build.sh [extensions|macos|all]"
        echo "  extensions: Sadece browser extensions için build alır"
        echo "  macos: Sadece macOS uygulaması için build alır"
        echo "  all: Hem extensions hem de macOS uygulaması için build alır"
        exit 1
        ;;
esac

print_success "Build işlemi tamamlandı! 🎉" 