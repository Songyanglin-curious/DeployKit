
import { app, dialog } from 'electron'

/**
 * 配置管理服务
 * 负责所有配置相关的业务逻辑
 */
export async function getSelectFolderPath(options = {}) {
    try {
        const result = await dialog.showOpenDialog({
            title: options.title || '选择文件夹',
            defaultPath: options.defaultPath || app.getPath('desktop'), // 默认从桌面开始
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: options.buttonLabel || '选择',
            // 可以添加其他对话框选项
            ...options
        });
        if (result.canceled) {
            // throw new Error('用户取消了选择')
        }
        return result.filePaths[0];
    } catch (error) {
        throw new Error(`无法打开目录对话框: ${error.message}`);
    }
}



