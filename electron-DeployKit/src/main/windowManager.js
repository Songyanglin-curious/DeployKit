const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
    createMainWindow() {
        const win = new BrowserWindow({
            width: 1000,
            height: 700,
            webPreferences: {
                preload: path.join(__dirname, '../preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        })

        const isDev = process.env.NODE_ENV === 'development'
        if (isDev) {
            win.loadURL('http://localhost:3000')
            win.webContents.openDevTools({ mode: 'detach' })
        } else {
            win.loadFile(path.join(__dirname, '../../dist/index.html'))
        }

        this.mainWindow = win
        return win
    }
}

module.exports = WindowManager