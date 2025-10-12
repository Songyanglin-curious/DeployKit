import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import fs from 'fs-extra'

const __dirname = dirname(fileURLToPath(import.meta.url))

class WindowManager {
    constructor(logger) {

        this.logger = logger

    }
    createMainWindow() {
        const isDev = process.env.NODE_ENV === 'development'

        const win = new BrowserWindow({
            width: 1000,
            height: 700,
            webPreferences: {
                preload: isDev
                    ? join(__dirname, 'preload.js')
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
                this.logger.info("start createMainWindow");
                const appPath = app.getAppPath();
                this.logger.info("appPath:" + appPath);
                const indexPath = join(appPath, 'renderer-dist/index.html');
                this.logger.info("indexPath:" + indexPath);

                if (!fs.existsSync(indexPath)) {
                    this.logger.error("Index file not found at:" + indexPath);
                    throw new Error("Index file not found");
                }

                win.loadFile(indexPath).catch(err => {
                    this.logger.error("Failed to load index file:", err);
                    throw err;
                });

                // 生产环境也打开开发者工具用于调试
                win.webContents.openDevTools({ mode: 'detach' });
            } catch (err) {
                this.logger.error("Failed to create main window in production:", err);
                app.quit();
            }
        }

        this.mainWindow = win
        return win
    }
}

export default WindowManager
