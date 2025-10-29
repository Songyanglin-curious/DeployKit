
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

export async function saveConfigContent(configFileName, content) {
    try {
        const configFile = join(PATHS.CONFIGS, `${configFileName}.json`)
        const contentStr = JSON.stringify(content, null, 2)
        fs.writeFileSync(configFile, contentStr, 'utf8')
        return true
    } catch (error) {
        log.error(`保存配置文件（${configFileName}）内容失败:`, error)
        throw new Error(`保存配置文件（${configFileName}）内容失败`);
    }
}
export async function deleteConfigByName(configFileName) {
    try {
        const configFile = join(PATHS.CONFIGS, `${configFileName}.json`)
        fs.removeSync(configFile)
        return true
    } catch (error) {
        log.error(`删除配置文件（${configFileName}）失败:`, error)
        throw new Error(`删除配置文件（${configFileName}）失败`);
    }
}

export async function getConfigPath() {
    try {
        return PATHS.CONFIGS;
    } catch (error) {
        log.error('获取配置文件路径失败:', error);
        throw new Error('获取配置文件路径失败');
    }
}

