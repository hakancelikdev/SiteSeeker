# Technical Documentation

## Architecture

### Core Components
- **Electron**: Desktop application framework
- **better-sqlite3**: High-performance SQLite database
- **electron-store**: Persistent configuration storage
- **electron-updater**: Auto-update functionality
- **electron-log**: Logging system

### Database Schema
```sql
-- History table
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    visit_count INTEGER DEFAULT 1,
    last_visit_time INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    folder TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## Build System

### Requirements
- Node.js 20 or later
- npm 9 or later
- Xcode Command Line Tools
- macOS 10.15 (Catalina) or later

### Build Configuration
```json
{
  "appId": "dev.hakancelik.siteseeker",
  "productName": "SiteSeeker",
  "mac": {
    "category": "public.app-category.developer-tools",
    "target": "pkg",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
```

### Build Process
1. Clean build directory
2. Install dependencies
3. Build for target architecture:
   - arm64 (Apple Silicon)
   - x64 (Intel)
   - universal (both)
4. Package as PKG installer
5. Generate blockmap for delta updates
6. Create latest-mac.yml for auto-updates

## Security

### Permissions
- Full Disk Access
- Chrome history access
- Firefox profile access

### Security Measures
- Hardened Runtime enabled
- Gatekeeper assessment disabled
- Custom entitlements
- Sandbox compliance
- Local data storage only

## Performance

### Optimization Techniques
- SQLite indexing
- Caching
- Lazy loading
- Background processing
- Efficient data structures

### Resource Usage
- Memory: ~100MB
- CPU: <1% idle
- Storage: ~50MB

## Testing

### Test Framework
- Jest
- Electron Test Runner
- Custom test utilities

### Test Coverage
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

## Development Workflow

### Git Flow
1. Feature branches from develop
2. Pull requests to develop
3. Release branches from develop
4. Tags for releases
5. Hotfix branches from main

### CI/CD Pipeline
1. Lint check
2. Unit tests
3. Build verification
4. Release creation
5. Auto-update deployment

## Dependencies

### Production
- better-sqlite3: ^9.6.0
- electron-log: ^5.3.3
- electron-store: ^8.2.0
- electron-updater: ^6.6.2

### Development
- @babel/core: ^7.26.10
- @babel/preset-env: ^7.26.9
- babel-jest: ^29.7.0
- electron: ^28.0.0
- electron-builder: ^24.13.3
- electron-rebuild: ^3.2.9
- jest: ^29.7.0

## Troubleshooting

### Common Issues
1. Permission errors
2. Database corruption
3. Update failures
4. Build errors
5. Performance issues

### Debugging
1. Check logs
2. Verify permissions
3. Clear cache
4. Rebuild database
5. Reinstall application

## Contributing

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript types
- JSDoc comments

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR
6. Address feedback
7. Merge when approved 