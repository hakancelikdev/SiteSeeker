#!/bin/bash

# Functions for colored output
print_info() {
    echo -e "\033[1;34m➡️ $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️ $1\033[0m"
}

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    # Check Xcode Command Line Tools
    if ! command -v xcode-select >/dev/null 2>&1; then
        print_error "Xcode Command Line Tools are not installed!"
        print_info "Install them using: xcode-select --install"
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Clean build directory
clean_dist() {
    print_info "Cleaning dist directory..."
    rm -rf dist
    if [ $? -eq 0 ]; then
        print_success "Cleaned dist directory"
    else
        print_error "Failed to clean dist directory!"
        exit 1
    fi
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies!"
        exit 1
    fi
}

# Build process
build_app() {
    local build_type=$1
    
    case "$build_type" in
        "universal")
            print_info "Building universal macOS app..."
            npm run build:universal
            ;;
        "arm64")
            print_info "Building Apple Silicon (M1/M2) version..."
            npm run build:arm64
            ;;
        "x64")
            print_info "Building Intel version..."
            npm run build:x64
            ;;
        "dev")
            print_info "Creating development build..."
            npm run build:dir
            ;;
        *)
            print_error "Invalid build type!"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed!"
        exit 1
    fi
}

# Main build process
main() {
    local build_type=$1
    
    check_requirements
    clean_dist
    install_deps
    build_app "$build_type"
    
    print_success "Build process completed! 🎉"
    
    case "$build_type" in
        "universal")
            print_info "Output: dist/SiteSeeker-*.dmg (Universal Binary)"
            ;;
        "arm64")
            print_info "Output: dist/SiteSeeker-*-arm64.dmg"
            ;;
        "x64")
            print_info "Output: dist/SiteSeeker-*-x64.dmg"
            ;;
        "dev")
            print_info "Output: dist/mac-*/SiteSeeker.app"
            ;;
    esac
}

# Script usage
if [ "$#" -ne 1 ]; then
    echo "Usage: ./build.sh [universal|arm64|x64|dev]"
    echo "  universal: Build universal binary (Intel + Apple Silicon)"
    echo "  arm64: Build for Apple Silicon only"
    echo "  x64: Build for Intel only"
    echo "  dev: Create development build"
    exit 1
fi

main "$1" 