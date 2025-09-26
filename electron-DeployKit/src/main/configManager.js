const fs = require('fs')
const path = require('path')

class ConfigManager {
    constructor() {
        this.configPath = this.getConfigPath()
    }

    getConfigPath() {
        const isDev = process.env.NODE_ENV === 'development'
        return isDev
            ? path.join(process.cwd(), 'config')
            : path.join(process.cwd(), 'resources/config')
    }

    getConfigFiles() {
        try {
            const files = fs.readdirSync(this.configPath)
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => path.basename(file, '.json'))
        } catch (error) {
            console.error('读取配置文件失败:', error)
            return []
        }
    }

    getProjectConfig(projectName) {
        try {
            const configFile = path.join(this.configPath, `${projectName}.json`)
            if (fs.existsSync(configFile)) {
                return JSON.parse(fs.readFileSync(configFile, 'utf8'))
            }
            return null
        } catch (error) {
            console.error('读取项目配置失败:', error)
            return null
        }
    }
}

module.exports = ConfigManager