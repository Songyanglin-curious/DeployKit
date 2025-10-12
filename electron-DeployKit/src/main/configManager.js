

import { app, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename, posix } from 'node:path'

import fs from 'fs-extra'    // ✅ 第三方库需支持 ESM（fs-extra v10+ 支持）


const __dirname = dirname(fileURLToPath(import.meta.url))


const productionResourcesPath = dirname(app.getAppPath());
class ConfigManager {
    constructor(logger) {
        this.isDev = process.env.NODE_ENV === 'development'
        this.logger = logger
        this.configPath = this.getConfigPath()
    }

    getConfigPath() {
        try {
            const configPath = this.isDev
                ? join(process.cwd(), 'config')
                : join(productionResourcesPath, 'config')
            
            this.logger.info('config:' + configPath)
            
            if (!this.isDev && !fs.existsSync(configPath)) {
                this.logger.error('Config directory not found at:' + configPath)
                throw new Error('Config directory not found')
            }
            
            return configPath
        } catch (err) {
            this.logger.error('Failed to get config path:', err)
            throw err
        }
    }
    getConfigFiles() {
        try {
            const files = fs.readdirSync(this.configPath, { encoding: 'utf8' })
            const result = files
                .filter(file => file.endsWith('.json'))
                .map(file => {
                    this.logger.info('配置文件名:' + file)
                    const filename = basename(file, '.json')
                    // 生产环境需要Buffer处理中文
                    const decodedName = filename
                    return decodedName
                })
            return result
        } catch (error) {
            this.logger.error('错误详情:', {
                configPath: this.configPath,
                error: error.message,
                stack: error.stack
            })
            return []
        }
    }

    getProjectConfig(projectName) {
        try {
            // 确保projectName正确编码
            const decodedName = Buffer.isBuffer(projectName)
                ? projectName.toString('utf8')
                : projectName
            const configFile = join(this.configPath, `${decodedName}.json`)
            if (fs.existsSync(configFile)) {
                const content = fs.readFileSync(configFile, 'utf8')
                return JSON.parse(content)
            }
            return null
        } catch (error) {
            this.logger.error('读取项目配置失败:', error)
            return null
        }
    }
    async getSelectFolderPath(options = {}) {
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
                return { success: false, message: '用户取消了选择', state: "canceled" };
            }

            return {
                success: true,
                path: result.filePaths[0],
                message: '文件夹选择成功',
                state: "success"
            };


        } catch (error) {

            return {
                success: false,
                message: `无法打开目录对话框: ${error.message}`,
                state: "error"
            };

        }
    }
    async generatePackage(sourcePath, targetPath, projectName, config, processKey) {
        this.logger.info('开始生成打包文件')

        // 确保projectName正确编码
        const decodedName = Buffer.isBuffer(projectName)
            ? projectName.toString('utf8')
            : projectName
        const sourceDirName = basename(sourcePath)
        const tempDir = join(targetPath, `temp_${Date.now()}`)
        const createdDirs = []
        let success = false

        try {
            // 确保临时目录存在
            fs.ensureDirSync(tempDir)

            // 1. 创建目标文件夹结构（先在临时目录中操作）

            for (const env of config.envs) {
                const envTargetPath = join(
                    tempDir,
                    `${decodedName}_${env}`
                )
                fs.ensureDirSync(envTargetPath)
                createdDirs.push(envTargetPath)

                // 拷贝sourcePath文件夹到envTargetPath
                const sourceFolderName = basename(sourcePath)
                const targetFolderPath = join(envTargetPath, sourceFolderName)
                fs.copySync(sourcePath, targetFolderPath)

                // const processPath = processPathDict[env]
                const processPath = config.backupAndUpdate.update[env];
                const backupPath = config.backupAndUpdate.backup[env];
                //获取最后一个文件夹名
                const processName = basename(processPath);

                //2. 生成备份脚本
                const backupScriptTemp = "backup.sh";
                const scriptTargetPath = join(envTargetPath, backupScriptTemp)
                const backupScriptTempPath = join(
                    this.isDev
                        ? join(process.cwd(), 'template')
                        : join(productionResourcesPath, "template"),
                    backupScriptTemp
                )
                if (fs.existsSync(backupScriptTempPath)) {
                    let content = fs.readFileSync(backupScriptTempPath, 'utf8')
                    // 注入环境变量并确保跨平台路径
                    const normalizedBackupPath = backupPath.replace(/\\/g, '/').replace(/\/+$/, '')
                    const normalizedProcessPath = processPath.replace(/\\/g, '/').replace(/\/+$/, '')
                    content = content.replace("{BACKUP_PATH}", normalizedBackupPath)
                    content = content.replace("{PROCESS_PATH}", normalizedProcessPath.replace(/^\/+/, '/'))
                    content = content.replace("{PROCESS_NAME}", processName)

                    // 收集要备份的文件列表
                    const filesToBackup = []
                    const walkDir = (dir, relativePath = '') => {
                        const entries = fs.readdirSync(dir, { withFileTypes: true })
                        for (const entry of entries) {
                            const fullPath = join(dir, entry.name)
                            const relPath = relativePath ? posix.join(relativePath, entry.name) : entry.name

                            if (entry.isDirectory()) {
                                walkDir(fullPath, relPath)
                            } else {
                                filesToBackup.push(relPath)
                            }
                        }
                    }

                    walkDir(sourcePath)

                    // 替换文件列表占位符
                    content = content.replace(
                        '{FILES_TO_BACKUP}',
                        filesToBackup.map(f => `"${f.replace(/"/g, '\\"')}"`).join(' ')
                    )

                    fs.writeFileSync(scriptTargetPath, content, { encoding: 'utf8' })
                    fs.chmodSync(scriptTargetPath, 0o755)
                }

                //3、生成更新脚本
                const updateScriptTemp = "update.sh";
                const updateScriptTargetPath = join(envTargetPath, updateScriptTemp)
                const updateScriptTempPath = join(
                    this.isDev
                        ? join(process.cwd(), 'template')
                        : join(productionResourcesPath, 'template'),
                    updateScriptTemp
                )
                if (fs.existsSync(updateScriptTempPath)) {
                    let content = fs.readFileSync(updateScriptTempPath, 'utf8')
                    // 注入环境变量并确保跨平台路径
                    const normalizedProcessPath = processPath.replace(/\\/g, '/').replace(/\/+$/, '')
                    const normalizedPackageName = sourceDirName.replace(/\\/g, '/').replace(/\/+$/, '')
                    content = content.replace(/{PROCESS_PATH}/g, normalizedProcessPath.replace(/^\/+/, '/'))
                    content = content.replace(/{PROCESS_NAME}/g, processName)
                    content = content.replace(/{PACKAGE_NAME}/g, normalizedPackageName)

                    fs.writeFileSync(updateScriptTargetPath, content, { encoding: 'utf8' })
                    fs.chmodSync(updateScriptTargetPath, 0o755)
                }

                //4、生成还原脚本
                const restoreScriptTemp = "restore.sh";
                const restoreScriptTargetPath = join(envTargetPath, restoreScriptTemp)
                const restoreScriptTempPath = join(
                    this.isDev
                        ? join(process.cwd(), 'template')
                        : join(productionResourcesPath, 'template'),
                    restoreScriptTemp
                )
                if (fs.existsSync(restoreScriptTempPath)) {
                    let content = fs.readFileSync(restoreScriptTempPath, 'utf8')
                    fs.writeFileSync(restoreScriptTargetPath, content, { encoding: 'utf8' })
                    fs.chmodSync(restoreScriptTargetPath, 0o755)
                }

                // 生成部署脚本
                const deployScriptTemp = "deploy.sh";
                const deployScriptTargetPath = join(envTargetPath, deployScriptTemp)
                const deployScriptTempPath = join(
                    this.isDev
                        ? join(process.cwd(), 'template')
                        : join(productionResourcesPath, 'template'),
                    deployScriptTemp
                )
                if (fs.existsSync(deployScriptTempPath)) {
                    let content = fs.readFileSync(deployScriptTempPath, 'utf8')
                    fs.writeFileSync(deployScriptTargetPath, content, { encoding: 'utf8' })
                    fs.chmodSync(deployScriptTargetPath, 0o755)
                }

            }

            // 所有操作成功，将临时目录移动到目标位置
            for (const dir of createdDirs) {
                const finalPath = join(targetPath, basename(dir))
                fs.moveSync(dir, finalPath, { overwrite: true })
            }
            fs.removeSync(tempDir)

            success = true
            return { success: true, message: '打包文件生成成功' }
        } catch (error) {
            this.logger.error('生成打包文件失败:', error)
            // 回滚：删除已创建的目录
            try {
                for (const dir of createdDirs) {
                    if (fs.existsSync(dir)) fs.removeSync(dir)
                }
                if (fs.existsSync(tempDir)) fs.removeSync(tempDir)
            } catch (cleanupError) {
                this.logger.error('清理临时文件失败:', cleanupError)
            }

            return {
                success: false,
                message: `打包文件生成失败: ${error.message}`,
                state: "error"
            }
        } finally {
            if (!success && fs.existsSync(tempDir)) {
                fs.removeSync(tempDir).catch(() => { })
            }
        }
    }
}

export default ConfigManager