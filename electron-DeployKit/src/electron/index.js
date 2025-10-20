import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import fs from 'fs-extra'
import path from 'node:path'

import { initializeApp, setupChineseMenu } from './appHooks.js'
import WindowManager from './windowManager.js'
import { setupIPCRoutes } from './ipc/ipcRouter.js'
import { pathConfig, PATHS } from './config/path'
import { isDev } from './utils/environment'

// 程序流程  index.js → new ElectronApp() → init() → app.whenReady() → createMainWindow() → setupAppEvents()
// 配置日志
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

class ElectronApp {
    constructor() {
        this.mainWindow = null;
        this.windowManager = null;
        this.init().catch(err => {
            log.error('初始化app失败:', err);
            app.quit();
        });
    }

    async init() {
        // 2. 等待应用准备就绪
        await app.whenReady(); // ✅ 只在这里等 ready


        initializeApp();
        setupChineseMenu();
        log.info('PATHS.CONFIGS:', PATHS.CONFIGS);

        log.info(`初始化app资源，processResources: ${pathConfig.processResources}, userData: ${pathConfig.userData}`)
        log.info('app初始化完成');
        // 初始化模块
        setupIPCRoutes();
        log.info('IPC 初始化完成');
        // 创建主窗口
        this.windowManager = new WindowManager()
        this.mainWindow = this.windowManager.createMainWindow();
        log.info('主窗口初始化完成');
        // 设置事件监听
        this.setupAppEvents();
        log.info('app启动完成');
    }

    setupAppEvents() {
        //  activate 事件：macOS 点 dock 图标时触发
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                log.info("app 触发 activate 事件，创建主窗口");
                this.mainWindow = this.windowManager.createMainWindow();
            }
        });

        //  窗口全部关闭时退出（Windows/Linux）
        app.on('window-all-closed', () => {
            log.info('app 触发 window-all-closed 事件，退出应用');
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }
}


// 启动应用
new ElectronApp();


