import log from 'electron-log'

class SimpleLogger {
    constructor() {
        // 配置日志
        log.transports.file.level = 'info'
        log.transports.console.level = 'debug'
        
        // 保留原有接口兼容性
        this.logLevels = ['error', 'warn', 'info', 'debug']
    }

    error(...args) {
        log.error(...args)
    }

    warn(...args) {
        log.warn(...args)
    }

    info(...args) {
        log.info(...args)
    }

    debug(...args) {
        log.debug(...args)
    }

    log(level, ...args) {
        switch(level) {
            case 'error': this.error(...args); break
            case 'warn': this.warn(...args); break
            case 'info': this.info(...args); break
            case 'debug': this.debug(...args); break
            default: log.info(...args)
        }
    }
}

export default SimpleLogger
