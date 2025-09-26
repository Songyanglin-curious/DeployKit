const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // 配置相关
    getConfigFiles: () => ipcRenderer.invoke('get-config-files'),
    getProjectConfig: (projectName) => ipcRenderer.invoke('get-project-config', projectName),

    // 文件操作相关（后续扩展）
    selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),

    // 脚本执行相关（后续扩展）
    executeScript: (scriptType) => ipcRenderer.invoke('script:execute', scriptType)
})