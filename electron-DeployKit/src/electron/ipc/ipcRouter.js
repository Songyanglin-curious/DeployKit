// ipcRouter.js
/**
 * IPC 路由管理器
 * 负责路由和分发 Electron 主进程与渲染进程间的通信请求
 * 提供统一的请求处理、错误管理和生命周期管理
 */
import { ipcMain } from 'electron'
import { createAsyncWrapper } from './asyncWrapper.js'
import { getSelectFolderPath, getConfigFiles, getConfigContentByName, saveConfigContent,deleteConfigByName, generatePackage } from '../services/index.js'

// 初始化异步包装器 - 为所有IPC路由提供统一的执行监控
const asyncWrapper = createAsyncWrapper()

/**
 * 创建带监控的IPC路由处理器
 * @param {Function} handler - 原始路由处理器函数
 * @param {String} route - IPC路由路径
 * @returns {Function} 包装后的安全路由处理器
 */
const createRouteHandler = (handler, route) => {
    return asyncWrapper.wrapAsync(handler, route)
}

/**
 * IPC 路由表
 * 定义所有IPC通信端点，清晰映射请求到对应的业务逻辑
 */
const routeTable = {
    // 健康检查路由
    'ping': () => 'pong',

    // 配置管理路由
    'get-config-files': () => getConfigFiles(),
    'get-project-config': (event, projectName) => getConfigContentByName(projectName),
    'save-project-config': (event, configFileName, config) => saveConfigContent(configFileName, config),
    'delete-project-config': (event, configFileName) => deleteConfigByName(configFileName),
    // 文件系统操作路由
    'get-select-folder-path': (event, options) =>
        getSelectFolderPath(options),

    // 打包生成路由 - 核心业务端点
    'generate-package': (event, sourcePath, targetPath, projectName, config) =>
        generatePackage(sourcePath, targetPath, projectName, config)
}

/**
 * 注册所有IPC路由
 * 将路由表映射到 Electron IPC 系统，建立完整的通信管道
 */
export const setupIPCRoutes = () => {

    Object.entries(routeTable).forEach(([route, handler]) => {
        ipcMain.handle(route, createRouteHandler(handler, route))
    })

}

/**
 * 注销所有IPC路由
 * 用于开发环境的热重载，避免路由冲突和内存泄漏
 */
export const cleanupIPCRoutes = () => {
    Object.keys(routeTable).forEach(route => {
        ipcMain.removeHandler(route)
    })
}

// 导出路由管理器接口
export default {
    setupIPCRoutes,
    cleanupIPCRoutes
}