# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Changed installer format from ZIP to PKG for better macOS integration
- Updated license from MIT to GPL-3.0
- Updated package-lock.json to match package.json configuration

### Fixed
- Fixed package-lock.json version and license inconsistencies
- Updated release.yml to handle PKG installer format
- Updated README.md with new installation instructions for PKG format

## [1.0.1] - 2025-04-17

### Fixed
- ARM64 (M1) build compatibility issues by updating Node.js version to 20
- Native module compilation for better-sqlite3 on ARM64 architecture

## [1.0.0] - 2025-04-16

### Added
- Jest test infrastructure and test files
- Browser history import tests
- Search functionality tests
- Main process tests
- Electron features for updates, logging, storage, and permissions
- Bookmark integration
- Permission checks and requests
- macOS build configuration and entitlements
- Chrome and Firefox extensions to release workflow
- Unified build script for macOS app and browser extensions
- Dynamic window sizing
- Import results modal
- Score display and total result count
- Extension icons in different sizes
- Firefox compatibility
- Modern UI improvements

### Changed
- Converted to native macOS application
- Removed browser extension code
- Migrated from sqlite/sqlite3 to better-sqlite3
- Improved UI layout and design
- Updated toolbar position to top right
- Enhanced URL counter and keyboard shortcuts styling
- Changed scoring system from logarithmic to integer-based
- Renamed project to SiteSeeker
- Updated extension name to SiteSeeker
- Improved search results display
- Improved history indexing mechanism
- Removed periodic updates in favor of event-based updates

### Fixed
- Window resize event handling
- Auto-updater configuration and error handling
- Score display
- Linter errors
- Electron-store initialization and error handling
- Native messaging host path for development
- Safari permission handling
- Search results display and window sizing logic

### Chore
- Updated package dependencies
- Reset version to 1.0.0
- Added electron-builder update configurations
- Added electron-updater, electron-log and electron-store dependencies
- Added comprehensive technical documentation
- Updated README with new features and installation instructions
- Added gitignore file
- Removed auto fill
- Removed manifest.json
- Added separate manifest files for Chrome and Firefox

### Security
- macOS entitlements for secure access to browser data
- Improved error handling and validation 