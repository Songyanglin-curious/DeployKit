import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import WindowManager from './windowManager.js'
import IPCHandler from './ipcHandlers.js'
import ConfigManager from './configManager.js'


// 配置日志
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

class ElectronApp {
    constructor() {
        this.init().catch(err => {
            console.error('Failed to initialize app:', err);
            app.quit();
        });
    }

    async init() {
        await app.whenReady(); // ✅ 只在这里等 ready

        log.info('Application starting...');
        // 初始化模块
        this.configManager = new ConfigManager(log);
        IPCHandler.init(this.configManager);
        // 创建主窗口
        this.mainWindow = new WindowManager(log)
        this.mainWindow.createMainWindow();

        // 设置事件监听
        this.setupAppEvents();

        log.info('IPC handlers initialized');
    }

    setupAppEvents() {
        // ✅ activate 事件：macOS 点 dock 图标时触发
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                log.info('Recreating main window from activate event');
                this.mainWindow = createMainWindow(log);
            }
        });

        // ✅ 窗口全部关闭时退出（Windows/Linux）
        app.on('window-all-closed', () => {
            log.info('All windows closed');
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }
}


// 启动应用
new ElectronApp();


