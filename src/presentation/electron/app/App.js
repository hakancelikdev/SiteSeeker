const path = require('path');

const { app, Tray, Menu, nativeImage } = require('electron');
const log = require('electron-log');

const MainWindow = require('../windows/MainWindow');
const ApplicationService = require('../../../application/services/ApplicationService');
const ElectronStore = require('../../../infrastructure/persistence/ElectronStore');
const HistoryRepository = require('../../../domain/repositories/HistoryRepository');
const HistoryService = require('../../../domain/services/HistoryService');
const BookmarkService = require('../../../domain/services/BookmarkService');

class App {
    constructor() {
        this.mainWindow = null;
        this.applicationService = null;
        this.tray = null;
    }

    async start() {
        try {
            await this.initialize();
            this.setupEventListeners();
        } catch (error) {
            log.error('Failed to start application:', error);
            app.quit();
        }
    }

    async initialize() {
        // Wait for app to be ready before creating window
        await app.whenReady();

        log.info('Initializing application...');

        // Configure app for macOS menu bar
        if (process.platform === 'darwin') {
            // Hide dock icon
            app.dock.hide();

            // Set as accessory to show only in menu bar
            app.setActivationPolicy('accessory');

            // Create a template image for the menu bar using the app icon
            const iconPath = path.join(__dirname, '../../../../build/icon.png');
            const icon = nativeImage.createFromPath(iconPath);

            // Set as template image
            icon.setTemplateImage(true);

            // Create tray with template image
            this.tray = new Tray(icon);

            // Create context menu
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: 'Search History & Bookmarks',
                    click: () => {
                        this.mainWindow.toggle();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Import Data',
                    click: () => {
                        this.mainWindow.show();
                        this.mainWindow.webContents.send('importHistory');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Preferences',
                    submenu: [
                        {
                            label: 'Launch at Login',
                            type: 'checkbox',
                            checked: app.getLoginItemSettings().openAtLogin,
                            click: () => {
                                const settings = app.getLoginItemSettings();
                                app.setLoginItemSettings({
                                    openAtLogin: !settings.openAtLogin
                                });
                            }
                        }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Quit SiteSeeker',
                    click: () => {
                        app.quit();
                    }
                }
            ]);

            // Set tooltip and context menu
            this.tray.setToolTip('SiteSeeker - Search History & Bookmarks');
            this.tray.setContextMenu(contextMenu);

            // Toggle window on click
            this.tray.on('click', () => {
                this.mainWindow.toggle();
            });
        }

        // Initialize dependencies
        const store = new ElectronStore();
        const historyRepository = new HistoryRepository(store);
        const historyService = new HistoryService(historyRepository);
        const bookmarkService = new BookmarkService(historyRepository);
        this.applicationService = new ApplicationService(historyService, bookmarkService);

        // Start application services
        await this.applicationService.initialize();
        log.info('Application initialized successfully');

        // Create main window
        this.mainWindow = new MainWindow();
        this.mainWindow.create();
    }

    setupEventListeners() {
        app.on('activate', () => {
            if (this.mainWindow) {
                this.mainWindow.show();
            }
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // Global error handler
        process.on('uncaughtException', (error) => {
            log.error('Uncaught Exception:', error);
            app.quit();
        });
    }
}

module.exports = App;
