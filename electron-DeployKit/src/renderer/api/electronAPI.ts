// src/utils/electronAPI.js
import { ConfigData } from '@/types/config';
import { createDiscreteApi } from 'naive-ui'
const { message: messageer } = createDiscreteApi(['message'])
class ElectronAPI {
    electronAPI: any;
    constructor() {
        this.electronAPI = window.electronAPI
    }

    // 统一的调用方法
    async _invoke(method: string, ...args: ({} | undefined)[]) {
        try {

            if (!this.electronAPI || !this.electronAPI[method]) {
                throw new Error(`Electron API 方法 ${method} 不可用`)
            }

            const result = await this.electronAPI[method](...args)

            // 统一处理返回格式
            if (result && result.success) {
                return result.data
            } else {
                throw new Error(result?.message || `调用 ${method} 失败`)
            }
        } catch (error) {
            // 统一错误处理
            this._handleError(method, error)
            throw error
        }
    }

    // 统一错误处理
    _handleError(method: string, error: any) {
        console.error(`[ElectronAPI Error] ${method}:`, error)

        // 这里可以集成你的消息提示系统
        // 比如：alert、Toast、Notification 等
        this.showMessage('error', error.message || '操作失败')
    }

    // 消息提示方法（可根据实际 UI 框架调整）
    showMessage(type: 'error' | 'success' | 'info' | 'warning', message: string) {
        try {
            messageer[type](message)
        } catch (error) {
            console.error(`[showMessage Error] ${type}:`, error);
        }

    }

    // 具体 API 方法
    async getConfigFiles() {
        return await this._invoke('getConfigFiles')
    }

    async getProjectConfig(projectName: any) {
        return await this._invoke('getProjectConfig', projectName)
    }

    async getSelectFolderPath(options = {}) {
        return await this._invoke('getSelectFolderPath', options)
    }

    async generatePackage(sourcePath: any, targetPath: any, projectName: any, config: any) {
        const result = await this._invoke('generatePackage', sourcePath, targetPath, projectName, config)
        // 特殊处理：生成包成功时显示成功消息

        return result
    }

    async saveProjectConfig(configFileName: string, config: ConfigData) {
        const result = await this._invoke('saveProjectConfig', configFileName, config);
        return result
    }
    async deleteProjectConfig(configFileName: string) {
        const result = await this._invoke('deleteProjectConfig', configFileName);
        return result
    }
    async getConfigPath() {
        const result = await this._invoke('getConfigPath',);
        return result
    }
}

// 创建单例
export const API = new ElectronAPI()