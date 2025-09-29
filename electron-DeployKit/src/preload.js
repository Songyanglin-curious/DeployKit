const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // 配置相关
    getConfigFiles: () => ipcRenderer.invoke('get-config-files'),
    getProjectConfig: (projectName) => ipcRenderer.invoke('get-project-config', projectName),


    getSelectFolderPath: (options) => ipcRenderer.invoke('get-select-folder-path', options),


    generatePackage: (sourcePath, targetPath, projectName, config, processKey) => ipcRenderer.invoke('generate-package', sourcePath, targetPath, projectName, config, processKey)
})