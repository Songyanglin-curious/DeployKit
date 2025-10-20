import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import fs from 'fs-extra'
import log from 'electron-log'

import { isDev } from './utils/environment'


class WindowManager {
    constructor() {

    }
    createMainWindow() {

        const win = new BrowserWindow({
            width: 1000,
            height: 700,

            webPreferences: {
                preload: isDev
                    ? join(app.getAppPath(), 'src/electron/preload.js')
                    : join(app.getAppPath(), 'dist-electron/preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false,
                // 开发环境下禁用webSecurity以支持HMR
                webSecurity: !isDev
            }
        })

        if (isDev) {
            win.loadURL('http://localhost:3000')
            win.webContents.openDevTools({ mode: 'detach' })
            // 启用HMR相关功能
            win.webContents.on('did-fail-load', () => {
                setTimeout(() => {
                    win.loadURL('http://localhost:3000')
                }, 500)
            })
        } else {
            try {
                // 生产环境下使用app.getAppPath()获取正确路径
                log.info("start createMainWindow");
                const appPath = app.getAppPath();

                const indexPath = join(appPath, 'dist-renderer/index.html');


                if (!fs.existsSync(indexPath)) {
                    log.error("Index file not found at:", indexPath);
                    throw new Error("Index file not found");
                }

                win.loadFile(indexPath).catch(err => {
                    log.error("Failed to load index file:", err);
                    throw err;
                });

                // 生产环境也打开开发者工具用于调试
                // win.webContents.openDevTools({ mode: 'detach' });
            } catch (err) {
                log.error("Failed to create main window in production:", err);
                app.quit();
            }
        }

        return win
    }
}

export default WindowManager
