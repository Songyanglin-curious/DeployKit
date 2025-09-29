const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
    createMainWindow() {
        const isDev = process.env.NODE_ENV === 'development'

        const win = new BrowserWindow({
            width: 1000,
            height: 700,
            webPreferences: {
                preload: path.join(__dirname, '../preload.js'),
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
            win.loadFile(path.join(__dirname, '../../dist/index.html'))
        }

        this.mainWindow = win
        return win
    }
}

module.exports = WindowManager