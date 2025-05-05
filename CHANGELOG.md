# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2024-05-05

### Fixed
- Fixed window hide functionality by removing incorrect parameter from hide() method

## [1.2.0] - 2024-05-04

### Added
- Added partial word search support
- Added bookmark search with 'b:' prefix
- Added combined score and visit time sorting
- Light/dark mode UI consistency for search bar, shortcut box, notification, and search icon
- Border to shortcut box in light mode
- User-friendly English placeholder for search input
- Added window drag functionality with position persistence
- Added window position repository for saving window positions

### Changed
- Improved window management with better positioning and state handling

### Fixed
- Fixed loading overlay not closing after import and reset operations
- Search icon visibility in all themes
- MaxListenersExceededWarning in MainWindow (event listeners are now only added once)

### Removed
- Remove fromTime parameter and simplify bookmark import

## [1.1.0] - 2025-04-30

### Fixed
- Fixed bookmark import timing and sequence issues
- Fixed Firefox history import to properly join with visit dates
- Fixed window hiding behavior when clicking outside or pressing ESC
- Fixed initial score calculation for history items
- Fixed database connection handling in browser providers

### Changed
- Migrated from better-sqlite3 to sqlite3 for better compatibility
- Improved Firefox history and bookmark import with better SQL queries
- Enhanced window management with automatic hiding on blur and ESC key
- Updated database queries to use proper async/await patterns
- Improved error handling in browser history providers

### Added
- Added automatic window hiding after opening URLs
- Added ESC key shortcut to hide window
- Added blur event handler to hide window when clicking outside

## [1.0.6] - 2024-04-27

### Changed
- Refactored main application structure for better organization and maintainability
- Improved IPC handlers with better error handling and logging
- Enhanced logging throughout the application
- Simplified main.js by moving functionality to dedicated classes
- Improved code organization and separation of concerns

### Fixed
- Fixed IPC communication between main and renderer processes
- Improved error handling in import and search operations
- Enhanced logging for better debugging and monitoring
- Fixed ESLint warnings related to unused parameters
- Fixed try-catch block syntax in PermissionService

## [1.0.5] - 2024-04-26

### Added
- Added bookmark import functionality from browsers
- Added bookmark icon display in search results
- Added bookmark service for managing bookmarks
- Added automatic bookmark import with periodic updates
- Added combined import for both history and bookmarks

### Changed
- Updated import button to handle both history and bookmarks
- Improved import notification to show both history and bookmark counts
- Enhanced UI to distinguish bookmarked items with a star icon

### Fixed
- Fixed import process to handle both history and bookmarks simultaneously
- Improved error handling for import operations

## [1.0.4] - 2024-04-26

### Fixed
- Fixed history import limit that was causing only 1000 items to be imported from each browser
- Fixed Chrome history date conversion error by using native JavaScript Date functions

### Changed
- Improved date formatting to show more human-readable relative times

## [1.0.3] - 2024-04-21

### Added
- Implemented new domain-driven architecture with clear separation of concerns
- Added new browser history providers for Chrome and Firefox
- Introduced permission management system for browser access
- Created new persistence layer using Electron Store
- Added IPC handlers for better main/renderer process communication
- Implemented new window management system
- Added new CSS styles for improved UI
- Added keyboard navigation support for search results
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
- Translated all log messages and comments from Turkish to English
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
- Fixed ARM64 (M1) build compatibility issues by updating Node.js version to 20
- Fixed native module compilation for better-sqlite3 on ARM64 architecture

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
- Fixed window resize event handling
- Fixed auto-updater configuration and error handling
- Fixed score display
- Fixed linter errors
- Fixed Electron-store initialization and error handling
- Fixed native messaging host path for development
- Fixed search results display and window sizing logic

### Security
- Added macOS entitlements for secure access to browser data
- Improved error handling and validation
