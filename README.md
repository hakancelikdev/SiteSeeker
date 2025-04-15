# SiteSeeker 🚀

Instantly search through your browser history and save time! Access your history quickly with a modern and elegant interface.

![SiteSeeker Banner](assets/banner.png)

## ✨ Why SiteSeeker?

- **⚡️ Instant Search**: Results in milliseconds
- **🎯 Smart Ranking**: Most visited pages always at the top
- **🔍 Multi-Browser Support**: Search Chrome, Firefox, and Safari history in one place
- **⌨️ Global Shortcut**: Quick access from anywhere with ⌘+⇧+Space
- **🎨 Modern Design**: Sleek and modern interface in macOS Sonoma style
- **🔄 Real-Time**: Instantly captures history updates
- **🔒 Privacy-Focused**: All data stays on your computer
- **📱 Two Usage Options**: Use as either a desktop app or Chrome extension

## 🛠 Development

### 📦 Building

#### Requirements
- Node.js and npm installed
- Xcode Command Line Tools installed for macOS

#### Quick Build (Recommended Method)
1. Clone the project:
   ```bash
   git clone https://github.com/hakancelikdev/SiteSeeker.git
   cd SiteSeeker
   ```

2. Build using the script:
   ```bash
   # Build for all platforms (macOS app + browser extensions)
   ./build.sh all

   # Build only browser extensions
   ./build.sh extensions

   # Build only macOS application
   ./build.sh macos
   ```

3. Build outputs:
   - Chrome Extension: `dist/siteseeker-chrome.zip`
   - Firefox Extension: `dist/siteseeker-firefox.zip`
   - macOS Application: `dist/SiteSeeker-1.0.0-arm64.dmg` (Apple Silicon) and `dist/SiteSeeker-1.0.0-arm64-mac.zip`

#### Testing the Extension

##### For Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Options:
   - Drag and drop `dist/siteseeker-chrome.zip` onto the page
   - Or select "Load unpacked" and choose the `dist/chrome` directory

##### For Firefox:
1. Go to `about:debugging`
2. Click on "This Firefox" tab
3. Select "Load Temporary Add-on" and choose `dist/firefox/manifest.json`

## 🎬 Quick Start

### 💻 As Desktop Application

1. Download the latest version from [Releases](https://github.com/hakancelikdev/SiteSeeker/releases)
2. Open the DMG file and install the application
3. Access from anywhere with ⌘+⇧+Space!

### 🔄 Manual Updates

While SiteSeeker checks for updates automatically when launched, you can also manually check and install updates:

1. Visit the [Releases](https://github.com/hakancelikdev/SiteSeeker/releases) page
2. Find the latest version (marked with a "Latest" tag)
3. Download the appropriate file:
   - For a fresh installation: Download `SiteSeeker-{version}.dmg`
   - For updating: You can use either the `.dmg` or `.zip` file
4. If using the DMG:
   - Open the downloaded DMG file
   - Drag SiteSeeker to the Applications folder
   - Replace the existing application if prompted
5. If using ZIP:
   - Extract the ZIP file
   - Move the extracted SiteSeeker app to your Applications folder
   - Replace the existing application if prompted

### 🔌 As Chrome Extension

1. Install the "SiteSeeker" extension from Chrome Web Store
2. Start using by clicking the icon in the browser toolbar

## 🌟 Featured Capabilities

### 🎯 Smart Search Algorithm
- Intelligent ranking based on visit frequency
- Instant search in URLs and titles
- Tolerant to typos

### 🎨 Modern and Elegant Interface
- macOS Sonoma style design
- Dynamic window sizing
- Smooth animations
- Dark mode support

### ⚡️ Performance-Focused
- Results in milliseconds
- Low system resource usage
- Minimal background impact

### 🔒 Privacy and Security
- Data stays only on your local device
- No data sharing
- Open source code

## 📊 User Experience

- **Quick Access**: Instant access from anywhere with global shortcut
- **Easy to Use**: Intuitive interface, minimal learning curve
- **Smart Results**: Most used pages always at the top
- **Statistics**: View imported and scanned history counts

## 🛠 Technical Features

- **Electron-Based**: Modern and fast desktop application
- **Chrome Manifest V3**: Latest technology extension support
- **SQLite Integration**: Fast and reliable data storage
- **Auto-Update System**: 
  - Automatic update checks on application launch
  - Silent download and installation of updates
  - Manual update option via GitHub Releases
  - Seamless version transitions

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
