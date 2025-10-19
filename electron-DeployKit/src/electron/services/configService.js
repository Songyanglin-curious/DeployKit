
import { join, basename } from 'node:path'
import fs from 'fs-extra'

import log from 'electron-log'
import { PATHS } from '../config/path'
/**
 * 配置管理服务
 * 负责所有配置相关的业务逻辑
 */
export async function getConfigFiles() {
    try {
        const files = fs.readdirSync(PATHS.CONFIGS, { encoding: 'utf8' })
        const result = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filename = basename(file, '.json')
                return filename;
            })
        return result
    } catch (error) {
        log.error('读取配置文件错误详情:', {
            configPath: PATHS.CONFIGS,
            error: error.message,
            stack: error.stack
        })
        throw new Error('读取配置文件失败');
    }
}
export async function getConfigContentByName(configFileName) {
    try {
        const configFile = join(PATHS.CONFIGS, `${configFileName}.json`)
        if (fs.existsSync(configFile)) {
            const content = fs.readFileSync(configFile, 'utf8')
            return JSON.parse(content)
        }
        return null
    } catch (error) {
        log.error(`读取配置文件（${configFileName}）内容失败:`, error)
        throw new Error(`读取配置文件（${configFileName}）内容失败`);
    }
}

