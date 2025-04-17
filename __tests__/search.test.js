const { searchHistory } = require('../main.js');

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

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockImplementation((query) => {
        const mockData = [
          { url: 'https://example.com', title: 'Example Website', last_visit_time: Date.now() },
          { url: 'https://test.com', title: 'Test Website', last_visit_time: Date.now() },
          { url: 'https://github.com', title: 'GitHub', last_visit_time: Date.now() },
        ];

        if (query.includes('example')) {
          return mockData.filter(item => 
            item.url.includes('example') || item.title.toLowerCase().includes('example')
          );
        } else if (query.includes('test')) {
          return mockData.filter(item => 
            item.url.includes('test') || item.title.toLowerCase().includes('test')
          );
        }
        return [];
      }),
    }),
    close: jest.fn(),
  }));
});

jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue([
      { url: 'https://example.com', title: 'Example Website', last_visit_time: Date.now() },
      { url: 'https://test.com', title: 'Test Website', last_visit_time: Date.now() },
      { url: 'https://github.com', title: 'GitHub', last_visit_time: Date.now() },
    ]),
    set: jest.fn(),
  }));
});

describe('Search Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return matching results for search term', async () => {
    const results = await searchHistory('example');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toBe('https://example.com');
  });

  test('should return empty array for no matches', async () => {
    const results = await searchHistory('nonexistent');
    expect(results).toBeDefined();
    expect(results.length).toBe(0);
  });

  test('should handle case-insensitive search', async () => {
    const results = await searchHistory('EXAMPLE');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toBe('https://example.com');
  });

  test('should handle partial matches', async () => {
    const results = await searchHistory('test');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toBe('https://test.com');
  });

  test('should handle special characters in search term', async () => {
    const results = await searchHistory('github.com');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toBe('https://github.com');
  });
}); 