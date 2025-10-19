// asyncWrapper.js
/**
 * 异步函数包装器模块
 * 为异步函数提供统一的错误处理、性能监控、日志记录和响应标准化
 */
import log from 'electron-log'

/**
 * 创建异步包装器实例
 * @returns {Object} 包含包装方法的对象
 */
export const createAsyncWrapper = () => {
    /**
     * 包装异步函数，提供完整的执行监控
     * @param {Function} asyncFn - 需要包装的异步函数
     * @param {String} context - 执行上下文标识，用于日志记录
     * @returns {Function} 包装后的增强异步函数
     */
    const wrapAsync = (asyncFn, context = 'unknown') => {
        return async (...args) => {
            const startTime = Date.now()

            try {
                log.info(`[IPC Start] ${context}`)
                const data = await asyncFn(...args)
                const duration = Date.now() - startTime
                log.info(`[IPC Success] ${context} - ${duration}ms`)
                // 统一成功返回格式
                return {
                    success: true,
                    data: data,
                    message: '操作成功',
                    timestamp: Date.now()
                }
            } catch (error) {
                const duration = Date.now() - startTime
                log.error(`[IPC Error] ${context} - ${duration}ms`, {
                    message: error.message,
                    stack: error.stack,
                    args: args.slice(1)
                })

                // 返回标准化的错误响应
                // 统一错误返回格式
                return {
                    success: false,
                    data: null,
                    message: error.message,
                    errorCode: error.code || 'INTERNAL_ERROR',
                    context,
                    timestamp: Date.now()
                }
            }
        }
    }

    return { wrapAsync }
}