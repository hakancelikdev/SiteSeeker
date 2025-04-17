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
- `npm test`: Run Jest tests
- `npm run clean`: Clean the dist directory
- `npm run build`: Build for production (universal binary)
- `npm run build:arm64`: Build for Apple Silicon only
- `npm run build:x64`: Build for Intel only
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
4. Generate blockmap files for differential updates
5. Create latest-mac.yml for auto-updates

### Architecture-Specific Builds

- For Apple Silicon (M1/M2):
  ```bash
  npm run build:arm64
  ```

- For Intel Macs:
  ```bash
  npm run build:x64
  ```

## Project Structure

```
SiteSeeker/
├── build/                  # Build configurations
│   └── entitlements.mac.plist
├── src/                    # Source code
├── assets/                 # Images and resources
├── dist/                   # Build output
├── __tests__/             # Test files
│   ├── browser-history.test.js
│   ├── search.test.js
│   └── main.test.js
├── .babelrc               # Babel configuration
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup
└── package.json           # Project configuration
```

## Code Style Guidelines

- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names
- Handle errors appropriately
- Write tests for new features
- Maintain test coverage above 80%

## Testing

### Test Structure
- Unit tests in `__tests__` directory
- Integration tests for browser interactions
- Performance tests for search functionality
- Security tests for data handling

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/browser-history.test.js

# Run with coverage
npm test -- --coverage
```

### Test Guidelines
1. Write tests before implementing features (TDD)
2. Test both success and error cases
3. Mock external dependencies
4. Use meaningful test descriptions
5. Keep tests focused and independent
6. Maintain high test coverage

Before submitting a pull request:
1. Run all tests
2. Verify test coverage
3. Test the application in development mode
4. Build and test a production version
5. Verify all features work correctly
6. Check for any console errors
7. Test on both Intel and Apple Silicon if possible

## Pull Request Process

1. Create a feature branch
2. Write tests for new features
3. Make your changes
4. Test thoroughly
5. Update documentation if needed
6. Submit a pull request
7. Wait for review

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
- **Test Failures**: Check mock implementations

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
- Database: better-sqlite3

### Firefox
- Location: ~/Library/Application Support/Firefox/Profiles/
- Files: places.sqlite
- Database: better-sqlite3

### Safari
- Location: ~/Library/Safari/
- Files: History.db
- Database: better-sqlite3

## Security Considerations

- Never store sensitive data
- Use secure API endpoints
- Follow macOS sandbox guidelines
- Handle user data responsibly
- Implement proper error handling
- Validate all user inputs
- Use prepared statements for database queries

## Questions or Problems?

- Check existing issues
- Create a new issue
- Join discussions
- Ask in our community

## License

By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0. 