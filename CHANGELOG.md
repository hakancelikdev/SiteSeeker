# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added Jest test infrastructure
- Added browser history import tests
- Added search functionality tests
- Added main process tests
- Electron-updater for automatic updates
- Electron-log for better logging capabilities
- Electron-store for persistent storage
- Permission checks and requests for browser history access
- Bookmark integration functionality
- macOS entitlements and permissions for Safari history access

### Changed
- Converted to native macOS application
- Removed browser extension code for a more native experience
- Migrated from sqlite/sqlite3 to better-sqlite3 for improved performance
- Improved UI layout and design with toolbar position and visual consistency

### Fixed
- Window resize event handling
- Auto-updater configuration and error handling
- Score display and calculation
- Linter errors

### Chore
- Updated package dependencies
- Reset version to 1.0.0 for the new native app approach
- Added electron-builder update configurations
- Added Jest configuration files
- Added Babel configuration

## [1.0.13] - 2025-04-15

### Added
- Improved UI layout and design
- Enhanced URL counter and keyboard shortcuts styling
- Better visual consistency
- Toolbar position updated to top right

### Fixed
- Window resize event handler improvements
- Score display issues

## [1.0.12] - 2025-04-15

### Changed
- Updated UI layout and design
- Enhanced visual consistency

## [1.0.11] - 2025-04-15

### Fixed
- Window resize event handler to use object parameter

## [1.0.10] - 2025-04-15

### Added
- Additional macOS permissions for Safari history access
- Improved error handling

## [1.0.9] - 2025-04-15

### Added
- Permission checks and requests
- Improved build configuration

## [1.0.8] - 2025-04-15

### Fixed
- Auto-updater configuration
- Error handling improvements

## [1.0.7] - 2025-04-15

### Added
- Electron-builder update configurations
- macOS build configuration updates

## [1.0.6] - 2025-04-15

### Added
- Updated entitlements for macOS
- Better-sqlite3 integration

### Changed
- Migrated from sqlite3 to better-sqlite3 for improved performance

## [1.0.5] - 2025-04-15

### Added
- macOS entitlements
- Disabled code signing for development

## [1.0.4] - 2025-04-15

### Changed
- Reverted Next.js changes
- Returned to Electron-based architecture

## [1.0.3] - 2025-04-15

### Added
- Next.js app structure with Tailwind CSS (later reverted)
- Updated release workflow

## [1.0.2] - 2025-04-15

### Added
- CI/CD workflow improvements
- Package.json updates

## [1.0.1] - 2025-04-15

### Added
- Background script functionality
- Main script updates

## [1.0.0] - 2025-04-15

### Added
- Initial release of SiteSeeker as a native macOS application
- Browser history search functionality with real-time capabilities
- Modern UI with dynamic window sizing
- Improved search results display
- URL counter functionality
- Keyboard shortcuts
- Centralized storage management
- Error handling and detailed logging

### Changed
- Scoring system from logarithmic to integer-based
- Storage limit management implementation
- Event-based updates instead of periodic updates

### Security
- macOS entitlements for secure access to browser data
- Improved error handling and validation

## [Pre-1.0.0] - 2025-02-12 to 2025-04-14

### Added
- Browser extension support for Chrome and Firefox
- Modern UI improvements
- Search functionality updates
- History indexing mechanism
- Storage limit management
- Centralized storage management
- Extension icons in various sizes
- Score display
- Total result count
- Safari permission handling
- Import results modal
- Native messaging support

### Changed
- Moved from periodic to event-based updates
- Improved code structure
- Enhanced error handling and logging
- Updated manifest files for browser compatibility
- Renamed project to SiteSeeker

### Fixed
- Score accumulation issues
- Search results display
- Window sizing logic
- Native messaging host path for development

### Documentation
- Added Firefox compatibility notes
- Updated installation instructions
- Added technical details section
- Improved development instructions
- Updated license to GPLv3 