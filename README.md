# SiteSeeker 🚀

Your intelligent browser history and bookmark search companion for macOS. Find anything in your browsing history instantly with a beautiful, native interface.

## ✨ Key Features

### 🔍 Smart Search
- **Lightning Fast**: Results in milliseconds
- **Intelligent Ranking**: Bookmarks and frequently visited pages prioritized
- **Partial Matching**: Find what you need even with partial words
- **Bookmark Search**: Quick access with 'b:' prefix

### 🎯 Browser Integration
- **Multi-Browser Support**: Chrome and Firefox in one place
- **Real-Time Sync**: Instant history and bookmark updates
- **Smart Import**: Automatic data synchronization
- **Visual Indicators**: Clear bookmark and history distinction

### 💻 Native Experience
- **Global Shortcut**: Quick access with ⌘+⇧+Space
- **Modern Design**: macOS Sonoma style interface
- **Dark Mode**: Seamless theme integration
- **Multi-Display**: Support for all your screens
- **Window Management**: Drag-and-drop positioning

### 🔒 Privacy & Performance
- **Local-First**: All data stays on your computer
- **Resource Efficient**: Minimal system impact
- **Secure Access**: macOS sandbox compliance
- **Fast Database**: Optimized SQLite integration

### 📊 Analytics & Usage Data
SiteSeeker uses Google Analytics to help us understand how users interact with the application. This helps us make better decisions about features and improvements. Here's what we collect and why:

- **Basic Usage Metrics**:
  - App launch frequency
  - Feature usage patterns
  - Search query patterns (anonymized)
  - Performance metrics

- **What We Don't Collect**:
  - Personal browsing history
  - Bookmark contents
  - Personal information
  - Search query contents
  - Browser data

- **Why We Use Analytics**:
  - Improve user experience
  - Identify popular features
  - Fix performance issues
  - Guide future development
  - Understand user needs

All analytics data is collected anonymously and in aggregate form. Your privacy is our top priority, and we never collect or store your personal browsing data or search history.

## 🚀 Quick Start

### Installation

1. **Download** the latest version from [Releases](https://github.com/hakancelikdev/SiteSeeker/releases)
2. **Install** using your preferred method:
   - **DMG (Recommended)**:
     1. Open the DMG file
     2. Drag to Applications
     3. Eject the disk image
   - **ZIP**:
     1. Extract the archive
     2. Move to Applications

3. **Launch** SiteSeeker from Applications
4. **Grant Permissions** when prompted:
   - Full Disk Access (for browser history)
   - Chrome history access
   - Firefox profile access

5. **Start Searching** with ⌘+⇧+Space!

### Auto Updates

SiteSeeker keeps itself up-to-date automatically:
- Background update checks
- Silent downloads
- Seamless installation
- Update notifications

## 🛠 Development

### Prerequisites

- Node.js (LTS version)
- npm
- Xcode Command Line Tools
- macOS 10.15+

### Development Commands

```bash
# Development mode
npm run dev

# Production mode
npm start

# Testing
npm test

# Building
npm run build        # Universal binary
npm run build:arm64  # Apple Silicon
npm run build:x64    # Intel Macs
```

#### Project Structure
```
SiteSeeker/
├── src/                    # Source code
│   ├── application/        # Application services and use cases
│   ├── domain/            # Domain models and business logic
│   ├── infrastructure/    # External services and implementations
│   └── presentation/      # UI components and views
├── public/                # Static assets
├── build/                 # Build configurations
├── coverage/              # Test coverage reports
├── .github/              # GitHub workflows and templates
├── __tests__/            # Test files
├── .babelrc              # Babel configuration
├── .eslintrc.cjs         # ESLint configuration
├── package.json          # Project configuration
└── main.js               # Application entry point
```


## 🌟 Advanced Features

### Smart Search Algorithm
- Intelligent relevance scoring
- Visit frequency weighting
- Bookmark prioritization
- Typo tolerance

### Performance Optimization
- Efficient data indexing
- Background sync
- Resource-aware operations
- Memory optimization

### Security Features
- Local data storage
- Secure browser access
- Permission management
- Data validation

## 🤝 Community & Support

- [GitHub Issues](https://github.com/hakancelikdev/SiteSeeker/issues)
- [Twitter Updates](https://x.com/hakancelikdev)
- [GitHub Discussions](https://github.com/hakancelikdev/SiteSeeker/discussions)

## 📝 License

[GNU General Public License v3.0](LICENSE)

## 👨‍💻 Developer

Hakan Çelik ([@hakancelikdev](https://x.com/hakancelikdev))

---

⭐️ Love SiteSeeker? Give it a star on GitHub!
