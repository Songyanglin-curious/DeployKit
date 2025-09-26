const { ipcMain } = require('electron')

class IPCHandler {
    static init(configManager) {
        this.configManager = configManager
        this.setupHandlers()
    }

    static setupHandlers() {
        // 基础测试
        ipcMain.handle('ping', () => 'pong')

        // 配置文件相关
        ipcMain.handle('get-config-files', () => {
            return this.configManager.getConfigFiles()
        })

        ipcMain.handle('get-project-config', (event, projectName) => {
            return this.configManager.getProjectConfig(projectName)
        })
    }
}

module.exports = IPCHandler