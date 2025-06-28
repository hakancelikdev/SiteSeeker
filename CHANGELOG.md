# SiteSeeker Changelog

Track the evolution of your favorite browser history search tool. This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.2.6] - 2025-05-28

### 🔄 Improvements
- **Import Process**: Unified import mechanism for both automatic and manual imports
- **Data Consistency**: Enhanced history and bookmark merging logic
- **Resource Management**: Added comprehensive cleanup procedures for all services
- **Window Management**: Improved window state handling during application quit

### 🐛 Bug Fixes
- **Fixed URL Count Inconsistency**: Resolved discrepancy between initial and manual import counts
- **Fixed Bookmark Preservation**: Ensured bookmark status is maintained during history updates
- **Fixed Memory Leaks**: Added proper cleanup of resources and event listeners
- **Fixed Window State**: Improved handling of window state during application quit


## [1.2.5] - 2025-05-27

### 🐛 Bug Fixes
- **Fixed UI Update Events**: Standardized event names for history and bookmark updates to ensure consistent UI updates
- **Fixed Bookmark Count Inconsistency**: Improved bookmark import mechanism to store all bookmarks in history repository, ensuring consistent bookmark counts between initial load and manual imports


## [1.2.4] - 2025-05-21

### ✨ New Features
- **Counter System**: Separate history and bookmark count display
- **Enhanced Logging**: Detailed count updates and error tracking
- **Bookmark Integration**: Improved bookmark count functionality

### 🔄 Improvements
- **UI Enhancements**:
  - Refined search icon positioning
  - Optimized light theme visibility
  - Enhanced toolbar layout
- **Performance**:
  - Streamlined window management
  - Simplified codebase
  - Reduced dependencies

### 🐛 Bug Fixes
- Fixed search icon visibility in light mode
- Resolved bookmark count update issues
- Corrected counter display problems
- Fixed event handling for bookmark updates

### 🗑️ Removed
- Removed unused dependencies (jest, babel-jest, axios, dotenv)
- Removed Google Analytics integration
- Removed automatic import mechanism

## [1.2.3] - 2025-05-07

### 🔄 Improvements
- Enhanced client ID generation with persistent storage

## [1.2.2] - 2025-05-06

### ✨ New Features
- **Command Key Support**: Hold Command (⌘) while clicking links to keep window open


## [1.2.1] - 2025-05-05

### Fixed
- Enhanced window management with improved hide functionality

## [1.2.0] - 2025-05-04

### ✨ New Features
- **Smart Search**: Introduced partial word matching for more intuitive results
- **Bookmark Search**: Quick access to bookmarks with the 'b:' prefix
- **Intelligent Sorting**: Combined relevance scoring with visit frequency
- **Enhanced UI**: Seamless light/dark mode transitions across all components
- **Window Management**: Drag-and-drop positioning with persistent placement

### 🔄 Improvements
- Optimized window positioning and state management

### 🐛 Bug Fixes
- Resolved loading overlay persistence issues
- Fixed theme-specific UI element visibility
- Optimized event listener management

### 🗑️ Removed
- Streamlined bookmark import process

## [1.1.0] - 2025-04-30

### 🐛 Bug Fixes
- Optimized bookmark synchronization timing
- Enhanced Firefox history data accuracy
- Improved window interaction behavior
- Refined search result scoring algorithm
- Strengthened database connection handling

### 🔄 Improvements
- Upgraded to sqlite3 for enhanced compatibility
- Optimized Firefox data import performance
- Enhanced window management automation
- Modernized database query patterns
- Strengthened error handling protocols

### ✨ New Features
- **Smart Window Management**: Automatic hiding after URL navigation
- **Keyboard Shortcuts**: Quick window control with ESC key
- **Intuitive Interaction**: Click-outside window dismissal

## [1.0.6] - 2025-04-27

### 🔄 Improvements
- **Architecture**: Implemented domain-driven design principles
- **Error Handling**: Enhanced IPC communication reliability
- **Logging**: Comprehensive system-wide logging implementation
- **Code Organization**: Modular architecture with clear separation of concerns

### 🐛 Bug Fixes
- Optimized process communication
- Enhanced error recovery mechanisms
- Improved debugging capabilities
- Resolved code quality issues

## [1.0.5] - 2025-04-26

### ✨ New Features
- **Bookmark Integration**: Seamless browser bookmark synchronization
- **Visual Enhancements**: Bookmark indicators in search results
- **Smart Import**: Unified history and bookmark management
- **Real-time Updates**: Automatic bookmark synchronization

### 🔄 Improvements
- Enhanced import functionality
- Optimized notification system
- Improved visual feedback

### 🐛 Bug Fixes
- Streamlined import processes
- Enhanced error handling

## [1.0.4] - 2025-04-26

### 🐛 Bug Fixes
- Removed history import limitations
- Optimized date handling for Chrome history

### 🔄 Improvements
- Enhanced time display formatting

## [1.0.3] - 2025-04-21

### ✨ New Features
- **Modern Architecture**: Domain-driven design implementation
- **Browser Integration**: Enhanced Chrome and Firefox support
- **Security**: Comprehensive permission management
- **Performance**: Optimized data persistence
- **UI/UX**:
  - Keyboard navigation
  - Favicon support
  - Multi-display compatibility
  - Modern visual design

### 🔄 Improvements
- **Code Quality**:
  - English documentation standardization
  - Enhanced error handling
  - Improved UI components
  - Optimized window management
- **Performance**:
  - Streamlined search results
  - Enhanced data validation
  - Improved display handling

### 🗑️ Removed
- Legacy test infrastructure
- Deprecated build scripts
- Outdated UI components

## [1.0.2] - 2025-04-18

### 🔄 Improvements
- **Installation**: Upgraded to PKG format for better macOS integration
- **License**: Transitioned to GPL-3.0
- **Build Process**: Enhanced release automation

### 🐛 Bug Fixes
- Resolved package configuration issues
- Updated installation documentation

## [1.0.1] - 2025-04-17

### 🐛 Bug Fixes
- Optimized ARM64 (M1) compatibility
- Enhanced native module support

## [1.0.0] - 2025-04-16

### ✨ New Features
- **Testing**: Comprehensive test infrastructure
- **Browser Support**: Chrome and Firefox integration
- **Security**: macOS-specific security enhancements
- **UI/UX**: Modern interface with dynamic sizing
- **Performance**: Optimized search and indexing

### 🔄 Improvements
- **Architecture**: Native macOS application conversion
- **Performance**: Enhanced database operations
- **UI/UX**: Modern design implementation
- **Search**: Improved result ranking

### 🐛 Bug Fixes
- Optimized window management
- Enhanced update system
- Improved error handling
- Fixed display issues

### 🔒 Security
- Implemented secure data access protocols
- Enhanced validation mechanisms
