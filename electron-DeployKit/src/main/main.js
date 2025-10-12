import { app, BrowserWindow } from 'electron'
import WindowManager from './windowManager.js'
import IPCHandler from './ipcHandlers.js'
import ConfigManager from './configManager.js'
import SimpleLogger from './SimpleLogger.js'


// 声明 logger（必须在顶层，供全局异常处理使用）
let logger;

class ElectronApp {
    constructor() {
        this.init().catch(err => {
            console.error('Failed to initialize app:', err);
            app.quit();
        });
    }

    async init() {
        await app.whenReady(); // ✅ 只在这里等 ready

        // 初始化 logger
        logger = new SimpleLogger(app);
        logger.info('Application starting...');

        // 初始化模块
        this.windowManager = new WindowManager(logger);

        this.configManager = new ConfigManager(logger);
        IPCHandler.init(this.configManager);

        // 创建主窗口（✅ 直接调用，不需要再包在 whenReady 里）
        this.windowManager.createMainWindow();

        // 设置事件监听
        this.setupAppEvents();

        logger.info('IPC handlers initialized');
    }

    setupAppEvents() {
        // ✅ activate 事件：macOS 点 dock 图标时触发
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                logger.info('Recreating main window from activate event');
                this.windowManager.createMainWindow();
            }
        });

        // ✅ 窗口全部关闭时退出（Windows/Linux）
        app.on('window-all-closed', () => {
            logger.info('All windows closed');
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

    }
}


// 启动应用
new ElectronApp();


