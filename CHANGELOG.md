# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Fixed
- Fixed history import limit that was causing only 1000 items to be imported from each browser
- Fixed Chrome history date conversion error by using native JavaScript Date functions

### Changed
- Improved date formatting to show more human-readable relative times (e.g., "2 minutes ago", "1 hour ago", "Yesterday")

## [1.0.3] - 2024-03-21

### Added
- Implemented new domain-driven architecture with clear separation of concerns
- Added new browser history providers for Chrome and Firefox
- Introduced permission management system for browser access
- Created new persistence layer using Electron Store
- Added IPC handlers for better main/renderer process communication
- Implemented new window management system
- Added new CSS styles for improved UI
- Added keyboard navigation support for search results (arrow keys and enter)
- Added favicon support for search results
- Added search icon to the search input
- Added automatic focus on window visibility
- Added multi-display support with separate windows for each display

### Removed
- Removed old test files in preparation for new testing strategy
- Removed old notarization script
- Removed old index.html and main.js files

### Fixed
- Fixed search results not being displayed in the UI
- Fixed empty title handling in browser history providers
- Improved error handling and validation in history providers
- Enhanced search results display with better formatting and styling
- Fixed window positioning and centering on multiple displays

### Changed
- Translated all log messages and comments from Turkish to English in main.js
- Improved code readability with consistent English documentation
- Standardized logging format across the application
- Updated search results UI with better visual hierarchy
- Enhanced date formatting for better readability
- Improved error handling in browser history providers
- Restructured project into domain-driven architecture
- Moved UI components to presentation layer
- Separated infrastructure concerns into dedicated modules
- Enhanced UI with transparent background and blur effect
- Improved search result cards layout and styling
- Updated window management for better multi-display support
- Enhanced keyboard shortcuts and focus management

## [1.0.2] - 2025-04-18

### Changed
- Changed installer format from ZIP to PKG for better macOS integration
- Updated license from MIT to GPL-3.0
- Updated package-lock.json to match package.json configuration
- Updated release workflow to create non-draft releases
- Improved release automation process

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