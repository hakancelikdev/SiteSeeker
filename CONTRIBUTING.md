# Contributing to SiteSeeker 🚀

First off, thanks for taking the time to contribute! 🎉

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Xcode Command Line Tools
- macOS 10.15 (Catalina) or later

### Environment Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SiteSeeker.git
   cd SiteSeeker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Scripts

We have several npm scripts available for development:

- `npm run dev`: Start the app in development mode
- `npm start`: Start the app in production mode
- `npm run clean`: Clean the dist directory
- `npm run build`: Build for production (universal binary)
- `npm run build:dir`: Create unpacked build (for testing)
- `npm run build:universal`: Build universal DMG (Intel + Apple Silicon)
- `npm run build:arm64`: Build for Apple Silicon only
- `npm run build:x64`: Build for Intel only
- `npm run pack`: Create unpacked build (for development)
- `npm run dist`: Create production DMG
- `npm run postinstall`: Rebuild native modules

## Build Process

### Development Build

For development and testing:
```bash
npm run dev
```

### Production Build

For creating a production build:
```bash
npm run build
```

This will:
1. Clean the dist directory
2. Build the application
3. Create a universal DMG file

### Architecture-Specific Builds

- For Apple Silicon (M1/M2):
  ```bash
  npm run build:arm64
  ```

- For Intel Macs:
  ```bash
  npm run build:x64
  ```

- For Universal Binary:
  ```bash
  npm run build:universal
  ```

## Project Structure

```
SiteSeeker/
├── build/                  # Build configurations
│   └── entitlements.mac.plist
├── src/                    # Source code
├── assets/                 # Images and resources
├── dist/                   # Build output
└── package.json           # Project configuration
```

## Code Style Guidelines

- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names
- Handle errors appropriately

## Testing

Before submitting a pull request:

1. Test the application in development mode
2. Build and test a production version
3. Verify all features work correctly
4. Check for any console errors
5. Test on both Intel and Apple Silicon if possible

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request
6. Wait for review

## Debugging

### Development Mode

1. Start in dev mode:
   ```bash
   npm run dev
   ```
2. Use Chrome DevTools for debugging
3. Check console for errors
4. Use electron-log for logging

### Common Issues

- **Native Module Issues**: Run `npm run postinstall`
- **Build Errors**: Try `npm run clean` then rebuild
- **Permission Issues**: Check entitlements.mac.plist

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create production build
4. Test thoroughly
5. Create a GitHub release
6. Publish

## Working with Browser Data

### Chrome
- Location: ~/Library/Application Support/Google/Chrome/Default/
- Files: History, Bookmarks

### Firefox
- Location: ~/Library/Application Support/Firefox/Profiles/
- Files: places.sqlite

## Security Considerations

- Never store sensitive data
- Use secure API endpoints
- Follow macOS sandbox guidelines
- Handle user data responsibly
- Implement proper error handling

## Questions or Problems?

- Check existing issues
- Create a new issue
- Join discussions
- Ask in our community

## License

By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0. 