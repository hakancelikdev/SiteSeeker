# SiteSeeker 🚀

Instantly search through your browser history and bookmarks on macOS! Access your history and bookmarks quickly with a modern and elegant native interface.

## ✨ Why SiteSeeker?

- **⚡️ Instant Search**: Results in milliseconds
- **🎯 Smart Ranking**: Bookmarks and most visited pages always at the top
- **🔖 Bookmark Integration**: Search through your browser bookmarks
- **🔍 Multi-Browser Support**: Search Chrome and Firefox history in one place
- **⌨️ Global Shortcut**: Quick access from anywhere with ⌘+⇧+Space
- **🎨 Native Design**: Sleek and modern interface in macOS Sonoma style
- **🔄 Real-Time**: Instantly captures history and bookmark updates
- **🔒 Privacy-Focused**: All data stays on your computer
- **💻 Native App**: Pure macOS application with full system integration

## 🛠 Development

### 📦 Building

#### Requirements
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Xcode Command Line Tools
- macOS 10.15 (Catalina) or later

#### Development Mode
```bash
# Start in development mode
npm run dev

# Start in production mode
npm start

# Run tests
npm test
```

#### Build Commands
```bash
# Clean build directory
npm run clean

# Build universal binary (Intel + Apple Silicon)
npm run build

# Build for specific architecture
npm run build:arm64  # Apple Silicon (M1/M2)
npm run build:x64    # Intel Macs
```

#### Build Outputs
After running `npm run build`, you'll find:
- `dist/SiteSeeker-[version].dmg`: Installer disk image
- `dist/SiteSeeker-[version]-mac.zip`: Portable ZIP archive
- `dist/*.blockmap`: Differential update files
- `dist/latest-mac.yml`: Auto-update configuration

## 🎬 Quick Start

1. Download the latest version from [Releases](https://github.com/hakancelikdev/SiteSeeker/releases)
2. Install using one of these methods:
   - **DMG Installation (Recommended)**:
     1. Double-click the DMG file
     2. Drag SiteSeeker to the Applications folder
     3. Eject the disk image
   - **ZIP Installation**:
     1. Extract the ZIP file
     2. Move SiteSeeker to the Applications folder
3. Launch SiteSeeker from your Applications folder
4. Grant necessary permissions when prompted:
   - Full Disk Access (required for browser history)
   - Chrome history file access
   - Firefox profile access
5. Access from anywhere with ⌘+⇧+Space!

### 🔄 Updates

SiteSeeker includes an automatic update system that:
- Checks for updates automatically on launch
- Downloads updates silently in the background
- Installs updates seamlessly
- Notifies you when updates are ready to apply

You can also manually update by:
1. Downloading the latest version from [Releases](https://github.com/hakancelikdev/SiteSeeker/releases)
2. Installing using either the DMG or ZIP method described above

## 🌟 Featured Capabilities

### 🎯 Smart Search Algorithm
- Intelligent ranking based on bookmarks and visit frequency
- Instant search in URLs and titles
- Tolerant to typos
- Bookmarks prioritized in search results

### 🎨 Native macOS Integration
- Native macOS Sonoma style design
- Dynamic window sizing
- Smooth animations
- System-wide dark mode support
- Visual bookmark indicators
- Full Disk Access integration
- Native notifications

### ⚡️ Performance-Focused
- Results in milliseconds
- Low system resource usage
- Minimal background impact
- Efficient data management
- better-sqlite3 integration

### 🔒 Privacy and Security
- Data stays only on your local device
- No data sharing or cloud sync
- Open source code
- Secure data handling
- macOS sandbox compliance

## 📊 User Experience

- **Quick Access**: Instant access from anywhere with global shortcut
- **Native Feel**: Looks and behaves like a native macOS app
- **Smart Results**: Bookmarks and most used pages always at the top
- **Visual Indicators**: Bookmarked pages marked with a star icon
- **Statistics**: View imported history and bookmark counts

## 🛠 Technical Features

- **Native Architecture**: Built specifically for macOS
- **Electron Core**: Modern and fast desktop application
- **better-sqlite3 Integration**: Fast and reliable data storage
- **Browser Integration**:
  - Automatic history and bookmark synchronization
  - Real-time updates
  - Support for Chrome and Firefox
- **Auto-Update System**: 
  - Automatic update checks
  - Silent download and installation
  - Manual update option
  - Seamless version transitions
- **Testing Infrastructure**:
  - Jest test framework
  - Unit and integration tests
  - Performance benchmarks
  - Security audits

## 🤝 Community and Support

- [GitHub Issues](https://github.com/hakancelikdev/SiteSeeker/issues): Bug reports and suggestions
- [Twitter](https://twitter.com/hakancelikdev): Updates and announcements
- [GitHub Discussions](https://github.com/hakancelikdev/SiteSeeker/discussions): Community discussions

## 📝 License

[GNU General Public License v3.0](LICENSE) - This software is free software. Anyone can copy, distribute, and/or modify this software.

## 👨‍💻 Developer

Hakan Çelik ([@hakancelikdev](https://twitter.com/hakancelikdev))

---

⭐️ If you like SiteSeeker, don't forget to give it a star!

## Download

Download the appropriate version for your Mac:

- **Apple Silicon (M1/M2) Macs**: 
  - DMG: [SiteSeeker-[version]-arm64.dmg](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - ZIP: [SiteSeeker-[version]-arm64-mac.zip](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - Optimized for M1/M2 processors
  - Better performance on Apple Silicon

- **Intel Macs**: 
  - DMG: [SiteSeeker-[version]-x64.dmg](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - ZIP: [SiteSeeker-[version]-x64-mac.zip](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - Optimized for Intel processors
  - Compatible with older Macs

- **Universal Binary**: 
  - DMG: [SiteSeeker-[version]-universal.dmg](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - ZIP: [SiteSeeker-[version]-universal-mac.zip](https://github.com/hakancelikdev/SiteSeeker/releases/latest)
  - Works on both Intel and Apple Silicon
  - Larger download size
  - Recommended if you're unsure about your Mac's processor

## Installation

1. Choose your preferred installation method:

   ### DMG Installation (Recommended)
   1. Download the DMG file for your Mac
   2. Double-click the DMG file to mount it
   3. Drag SiteSeeker to your Applications folder
   4. Eject the disk image
   5. Launch SiteSeeker from Applications

   ### ZIP Installation
   1. Download the ZIP file for your Mac
   2. Double-click to extract
   3. Move SiteSeeker to your Applications folder
   4. Launch SiteSeeker from Applications

Note: On first launch, you might need to:
1. Right-click (or Control-click) the app
2. Select "Open"
3. Click "Open" in the security dialog

## Auto Updates

SiteSeeker includes an automatic update system that:
- Checks for updates automatically on launch
- Downloads updates silently in the background
- Installs updates seamlessly
- Notifies you when updates are ready to apply
- Supports differential updates to minimize download size

## Permissions

SiteSeeker requires the following permissions:
- Full Disk Access (to read browser history files)
- Chrome history access
- Firefox history access

These permissions are requested when you first launch the app.

## Development

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- macOS 12 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/hakancelikdev/SiteSeeker.git

# Install dependencies
npm install

# Start the app in development mode
npm start
```

### Building

```bash
# Build for Apple Silicon (M1/M2)
npm run build:arm64

# Build for Intel
npm run build:x64

# Build Universal Binary
npm run build:universal
```

## License

MIT © [Hakan Çelik](https://github.com/hakancelikdev)
