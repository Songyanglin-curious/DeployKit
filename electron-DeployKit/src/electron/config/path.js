// /src/electron/config/paths.js
/**
 * 应用路径配置管理器
 * 统一管理所有文件系统路径，支持开发和生产环境
 */
import path from 'node:path'
import fs from 'fs-extra'
import { app } from 'electron'
import { isDev } from '../utils/environment.js'

/**
 * 基础路径配置
 */
class PathConfig {
    constructor() {
        // app.getAppPath()  开发环境指的是package.json所在文件夹   生产环境指的是app文件夹 或者app.asar文件夹 
        // 应用基础路径
        this.appRoot = isDev ? app.getAppPath() : path.dirname(app.getPath('exe'))

        // 用户数据路径 (跨平台兼容)
        this.userData = app.getPath('userData')
        /**
         * C:\Users\15034\AppData\Local\Programs\deployKit\resources\resources
         * process.resourcesPath: C:\Users\15034\AppData\Local\Programs\deployKit\resources
         * 配置文件在:C:\Users\15034\AppData\Local\Programs\deployKit\resources\resources 下面
         */
        this.processResources = this.processResources = isDev ?
            path.join(app.getAppPath(), 'resources') :
            path.join(process.resourcesPath, 'resources')
    }

    /**
     * 获取配置文件夹路径
     */
    get configDir() {
        // 开发环境使用项目内的配置，生产环境使用用户数据目录
        if (isDev) {
            return path.join(this.appRoot, 'resources', 'configs')
        } else {
            return path.join(this.userData, 'configs')
        }
    }

    /**
     * 获取模板文件夹路径
     */
    get templateDir() {
        // 开发环境使用项目内的模板，生产环境使用资源目录
        if (isDev) {
            return path.join(this.appRoot, 'resources', 'templates')
        } else {
            return path.join(this.processResources, 'templates')
        }
    }





    /**
     * 获取日志文件夹路径
     */
    get logDir() {
        return path.join(this.userData, 'logs')
    }


    /**
     * 获取项目特定配置路径
     */
    getProjectConfigPath(projectName) {
        return path.join(this.configDir, `${projectName}.json`)
    }

    /**
     * 获取模板文件完整路径
     */
    getTemplatePath(templateName) {
        return path.join(this.templateDir, templateName)
    }

    /**
     * 验证路径是否存在，不存在则创建
     */
    async ensurePathExists(dirPath) {
        try {
            await fs.access(dirPath)
        } catch {
            await fs.mkdir(dirPath, { recursive: true })
        }
        return dirPath
    }
}

// 创建单例实例
export const pathConfig = new PathConfig()

// 导出常用路径别名（方便使用）

export const PATHS = {
    CONFIGS: pathConfig.configDir,
    TEMPLATES: pathConfig.templateDir,

    LOGS: pathConfig.logDir,

}