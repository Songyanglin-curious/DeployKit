/**
app，这个模块控制着您应用程序的事件生命周期。
BrowserWindow，这个模块创建和管理 app 的窗口。
 */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html');
    win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

//process.platform 宿主环境变量 win32 (Windows), linux (Linux) 和 darwin (macOS) 。
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})