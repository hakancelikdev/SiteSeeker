const { importBrowserHistories, getChromeProfiles } = require('../main.js');
const fs = require('fs');
const path = require('path');

jest.mock('electron-updater', () => ({
  autoUpdater: {
    logger: {
      transports: {
        file: {
          level: 'info'
        }
      }
    },
    autoDownload: true,
    autoInstallOnAppQuit: true,
    on: jest.fn(),
  }
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  copyFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({
    isDirectory: () => true,
    isFile: () => true
  }),
  readdirSync: jest.fn().mockReturnValue([
    'Default',
    'Profile 3',
    'Guest Profile'
  ]),
}));

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([
        { url: 'https://example.com', title: 'Example', last_visit_time: Date.now() },
        { url: 'https://test.com', title: 'Test', last_visit_time: Date.now() }
      ]),
      run: jest.fn(),
    }),
    close: jest.fn(),
  }));
});

jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }));
});

describe('Browser History Import Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get Chrome profiles correctly', async () => {
    const profiles = await getChromeProfiles();
    expect(profiles).toBeDefined();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(0);
  });

  test('should import browser histories successfully', async () => {
    fs.copyFileSync.mockImplementation(() => true);
    fs.statSync.mockImplementation(() => ({
      isDirectory: () => true,
      isFile: () => true
    }));
    
    const result = await importBrowserHistories();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.totalItems).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty browser histories', async () => {
    fs.copyFileSync.mockImplementation(() => true);
    fs.statSync.mockImplementation(() => ({
      isDirectory: () => true,
      isFile: () => true
    }));
    
    const mockDb = jest.fn().mockImplementation(() => ({
      prepare: jest.fn().mockReturnValue({
        all: jest.fn().mockReturnValue([]),
        run: jest.fn(),
      }),
      close: jest.fn(),
    }));

    const result = await importBrowserHistories();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.totalItems).toBe(0);
  });

  test('should handle file system errors gracefully', async () => {
    fs.copyFileSync.mockImplementation(() => {
      throw new Error('File system error');
    });
    fs.statSync.mockImplementation(() => ({
      isDirectory: () => true,
      isFile: () => true
    }));

    const result = await importBrowserHistories();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.totalItems).toBe(0);
  });
}); 