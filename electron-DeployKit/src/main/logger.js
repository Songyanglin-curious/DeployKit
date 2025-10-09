const fs = require('fs');
const path = require('path');

class SimpleLogger {
    constructor(app) {
        this.logLevels = ['error', 'warn', 'info', 'debug'];
        this.logLevel = 'debug';

        try {
            // 使用更可靠的目录创建方式
            const fsExtra = require('fs-extra');
            const logDir = path.join(app.getPath('userData'), 'logs');
            
            // 确保目录存在
            fsExtra.ensureDirSync(logDir);
            
            this.logFile = path.join(logDir, 'app.log');
            
            // 确保日志文件存在
            fsExtra.ensureFileSync(this.logFile);
        } catch (err) {
            console.error('初始化日志系统失败:', err);
            // 回退到临时目录
            const os = require('os');
            this.logFile = path.join(os.tmpdir(), 'electron-deploykit.log');
            console.warn(`使用临时文件作为日志: ${this.logFile}`);
        }
    }

    setLevel(level) {
        if (this.logLevels.includes(level)) {
            this.logLevel = level;
        }
    }

    _shouldLog(level) {
        return this.logLevels.indexOf(level) <= this.logLevels.indexOf(this.logLevel);
    }

    _formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `${timestamp} [${level}]: ${message}`;
    }

    _writeToFile(message) {
        fs.appendFileSync(this.logFile, message + '\n');
    }

    log(level, message) {
        if (!this._shouldLog(level)) return;

        const formatted = this._formatMessage(level, message);
        console.log(formatted);
        this._writeToFile(formatted);
    }

    error(message) {
        this.log('error', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    info(message) {
        this.log('info', message);
    }

    debug(message) {
        this.log('debug', message);
    }
}

module.exports = SimpleLogger;
