const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // 配置相关
    getConfigFiles: () => ipcRenderer.invoke('get-config-files'),
    getProjectConfig: (projectName) => ipcRenderer.invoke('get-project-config', projectName),
    saveProjectConfig: (configFileName, config) => ipcRenderer.invoke('save-project-config', configFileName, config),
    deleteProjectConfig: (configFileName) => ipcRenderer.invoke('delete-project-config', configFileName),
    getConfigPath: () => ipcRenderer.invoke('get-config-path'),

    getSelectFolderPath: (options) => ipcRenderer.invoke('get-select-folder-path', options),


    generatePackage: (sourcePath, targetPath, projectName, config) => ipcRenderer.invoke('generate-package', sourcePath, targetPath, projectName, config)

})