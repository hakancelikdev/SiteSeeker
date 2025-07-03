const path = require('path');

const { app, Tray, Menu, nativeImage } = require('electron');
const log = require('electron-log');

const MainWindow = require('../windows/MainWindow');
const PermissionDialogWindow = require('../windows/PermissionDialogWindow');
const ApplicationService = require('../../../application/services/ApplicationService');
const ElectronStore = require('../../../infrastructure/persistence/ElectronStore');
const HistoryRepository = require('../../../domain/repositories/HistoryRepository');
const HistoryService = require('../../../domain/services/HistoryService');
const BookmarkService = require('../../../domain/services/BookmarkService');

class App {
    constructor() {
        this.mainWindow = null;
        this.permissionDialogWindow = null;
        this.applicationService = null;
        this.tray = null;
        this.permissionDialogShown = false;
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

        // Check if we should show permission dialog first
        const shouldShowPermissionDialog = await this.shouldShowPermissionDialog();
        
        if (shouldShowPermissionDialog) {
            log.info('Showing permission dialog first');
            await this.showPermissionDialog();
        } else {
            log.info('Permission dialog not needed, starting full application services');
            
            // Start import since permission was already granted
            log.info('Permission already granted, starting full application services...');
            try {
                await this.applicationService.startImportAfterPermission();
                log.info('Full application services started successfully');
            } catch (error) {
                log.error('Error starting full application services:', error);
            }
        }
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

    async shouldShowPermissionDialog() {
        try {
            // Check if we have stored browser data paths
            const hasStoredPaths = await this.applicationService.hasStoredBrowserDataPaths();
            return !hasStoredPaths;
        } catch (error) {
            log.error('Error checking permission dialog status:', error);
            return true; // Show dialog if there's an error
        }
    }

    async showPermissionDialog() {
        try {
            log.info('Creating permission dialog window...');
            this.permissionDialogWindow = new PermissionDialogWindow();
            await this.permissionDialogWindow.create();
            this.permissionDialogWindow.show();
            this.permissionDialogShown = true;

            // Set up IPC handlers for permission dialog
            this.setupPermissionDialogHandlers();
        } catch (error) {
            log.error('Error showing permission dialog:', error);
            // Fallback to main window if permission dialog fails
            await this.createMainWindow();
        }
    }

    async createMainWindow() {
        try {
            log.info('Creating main window...');
            this.mainWindow = new MainWindow();
            await this.mainWindow.create();
        } catch (error) {
            log.error('Error creating main window:', error);
        }
    }

    setupPermissionDialogHandlers() {
        const { ipcMain } = require('electron');

        // Handle permission dialog completion
        ipcMain.on('permission-dialog-completed', async (event, data) => {
            try {
                log.info('Permission dialog completed:', data);
                
                // Close permission dialog
                if (this.permissionDialogWindow) {
                    this.permissionDialogWindow.close();
                    this.permissionDialogWindow = null;
                }

                if (data.granted) {
                    // If permission was granted, start full application services
                    log.info('Permission granted, starting full application services...');
                    try {
                        await this.applicationService.startImportAfterPermission();
                        log.info('Full application services started successfully after permission');
                    } catch (error) {
                        log.error('Error starting full application services after permission:', error);
                    }
                } else {
                    // If permission was skipped, close the app
                    log.info('Permission skipped, closing application...');
                    app.quit();
                }
            } catch (error) {
                log.error('Error handling permission dialog completion:', error);
            }
        });

        // Handle browser data access grant from permission dialog
        ipcMain.on('grant-browser-data-access', async (event) => {
            try {
                log.info('Browser data access granted from permission dialog');
                
                // Get the default browser data paths
                const paths = await this.applicationService.getBrowserDataPaths();
                
                // Store the default paths
                if (paths.length > 0) {
                    await this.applicationService.storeDefaultBrowserDataPaths();
                    log.info('Default browser data paths stored successfully');
                    this.permissionDialogWindow.send('browser-data-access-result', { 
                        success: true, 
                        paths: paths 
                    });
                } else {
                    log.warn('No browser data paths found');
                    this.permissionDialogWindow.send('browser-data-access-result', { 
                        success: false, 
                        error: 'No browser data found on your system' 
                    });
                }
            } catch (error) {
                log.error('Error during browser data access grant:', error);
                this.permissionDialogWindow.send('browser-data-access-result', { 
                    success: false, 
                    error: error.message 
                });
            }
        });

        // Handle get browser data paths from permission dialog
        ipcMain.on('get-browser-data-paths', async (event) => {
            try {
                log.info('Get browser data paths request from permission dialog');
                log.info('Permission dialog window exists:', !!this.permissionDialogWindow);
                
                const paths = await this.applicationService.getBrowserDataPaths();
                log.info('Retrieved browser data paths:', paths);
                log.info('Permission dialog window webContents exists:', !!this.permissionDialogWindow?.webContents);
                
                if (this.permissionDialogWindow && this.permissionDialogWindow.webContents) {
                    log.info('Sending browser data paths to permission dialog:', paths);
                    this.permissionDialogWindow.send('browser-data-paths', paths);
                } else {
                    log.error('Permission dialog window or webContents not available');
                }
            } catch (error) {
                log.error('Error getting browser data paths:', error);
                if (this.permissionDialogWindow) {
                    this.permissionDialogWindow.send('browser-data-paths', []);
                }
            }
        });
    }
}

module.exports = App;
