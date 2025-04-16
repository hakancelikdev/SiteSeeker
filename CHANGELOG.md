# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

## [1.0.0] - 2025-04-16

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