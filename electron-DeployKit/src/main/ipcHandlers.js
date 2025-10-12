import { ipcMain } from 'electron'

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
        ipcMain.handle('get-select-folder-path', (event, options) => {
            return this.configManager.getSelectFolderPath(options)
        })
        ipcMain.handle('generate-package', (event, sourcePath, targetPath, projectName, config, processKey) => {
            return this.configManager.generatePackage(sourcePath, targetPath, projectName, config, processKey)
        })
    }
}

export default IPCHandler