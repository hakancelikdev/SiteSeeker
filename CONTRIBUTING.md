# Contributing to SiteSeeker 🚀

Thank you for your interest in contributing to SiteSeeker! This document will guide you through the contribution process.

## 🤝 How to Contribute

### 1. Getting Started

#### Prerequisites
- Node.js (LTS version)
- npm
- Xcode Command Line Tools
- macOS 10.15+

#### Setup
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

### 2. Development Workflow

#### Available Scripts
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

### 3. Code Style

#### General Guidelines
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names
- Handle errors appropriately

#### JavaScript/TypeScript
- Use async/await for asynchronous operations
- Implement proper error handling
- Follow ESLint configuration
- Write self-documenting code
- Use TypeScript types where applicable

#### CSS/Styling
- Follow BEM naming convention
- Use CSS variables for theming
- Keep styles modular
- Support dark/light modes
- Ensure responsive design

### 4. Testing

#### Test Structure
- Unit tests in `__tests__` directory
- Integration tests for browser interactions
- Performance tests for search functionality
- Security tests for data handling

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/browser-history.test.js

# Run with coverage
npm test -- --coverage
```

#### Test Guidelines
1. Write tests before implementing features (TDD)
2. Test both success and error cases
3. Mock external dependencies
4. Use meaningful test descriptions
5. Keep tests focused and independent
6. Maintain high test coverage

### 5. Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write tests for new features
   - Update documentation
   - Follow code style guidelines
   - Test thoroughly

3. **Commit Your Changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template
   - Describe your changes
   - Link related issues
   - Request reviews

### 6. Quality Checklist

Before submitting a pull request:
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Performance is optimized
- [ ] Security is considered
- [ ] Cross-platform compatibility

### 7. Browser Data Handling

#### Chrome
- Location: `~/Library/Application Support/Google/Chrome/Default/`
- Files: History, Bookmarks
- Database: better-sqlite3

#### Firefox
- Location: `~/Library/Application Support/Firefox/Profiles/`
- Files: places.sqlite
- Database: better-sqlite3

### 8. Security Guidelines

- Never store sensitive data
- Use secure API endpoints
- Follow macOS sandbox guidelines
- Handle user data responsibly
- Implement proper error handling
- Validate all user inputs
- Use prepared statements for database queries

### 9. Debugging

#### Development Mode
1. Start in dev mode:
   ```bash
   npm run dev
   ```
2. Use Chrome DevTools
3. Check console for errors
4. Use electron-log for logging

#### Common Issues
- **Native Module Issues**: Run `npm run postinstall`
- **Build Errors**: Try `npm run clean` then rebuild
- **Permission Issues**: Check entitlements.mac.plist
- [ ] Test Failures**: Check mock implementations

### 10. Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create production build
4. Test thoroughly
5. Create a GitHub release
6. Publish

## 🤔 Questions or Problems?

- Check existing issues
- Create a new issue
- Join discussions
- Ask in our community

## 📝 License

By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0.
