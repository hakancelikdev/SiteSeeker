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
- `dist/SiteSeeker-1.0.0-universal.dmg`: Universal installer (Intel + Apple Silicon)
- `dist/SiteSeeker-1.0.0-arm64.dmg`: Apple Silicon specific installer
- `dist/SiteSeeker-1.0.0-x64.dmg`: Intel specific installer
- `dist/*.blockmap`: Differential update files
- `dist/latest-mac.yml`: Auto-update configuration

## 🎬 Quick Start

1. Download the latest version from [Releases](https://github.com/hakancelikdev/SiteSeeker/releases)
2. Open the DMG file and drag SiteSeeker to your Applications folder
3. Launch SiteSeeker from your Applications folder
4. Grant necessary permissions when prompted:
   - Full Disk Access (required for browser history)
   - Chrome history file access
   - Firefox profile access
5. Access from anywhere with ⌘+⇧+Space!

### 🔄 Updates

SiteSeeker checks for updates automatically when launched, but you can also manually update:

1. Visit the [Releases](https://github.com/hakancelikdev/SiteSeeker/releases) page
2. Download the latest version
3. Replace the existing application in your Applications folder

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
