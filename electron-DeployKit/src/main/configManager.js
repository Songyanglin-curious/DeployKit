const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
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
            console.error('打开目录对话框失败:', error);
            return {
                success: false,
                message: `无法打开目录对话框: ${error.message}`,
                state: "error"
            };

        }
    }
    async generatePackage(sourcePath, targetPath, projectName, config, processKey) {
        console.log('开始生成打包文件')
        const fs = require('fs-extra')
        const sourceDirName = path.basename(sourcePath)
        const tempDir = path.join(targetPath, `temp_${Date.now()}`)
        const createdDirs = []
        let success = false

        try {
            // 确保临时目录存在
            fs.ensureDirSync(tempDir)

            // 1. 创建目标文件夹结构（先在临时目录中操作）
            const processPathDict = config.process[processKey]
            for (const env of config.envs) {
                const envTargetPath = path.join(
                    tempDir,
                    `${projectName}_${env}`
                )
                fs.ensureDirSync(envTargetPath)
                createdDirs.push(envTargetPath)

                // 拷贝sourcePath文件夹到envTargetPath
                const sourceFolderName = path.basename(sourcePath)
                const targetFolderPath = path.join(envTargetPath, sourceFolderName)
                fs.copySync(sourcePath, targetFolderPath)

                const processPath = processPathDict[env]
                const backupPath = config.backupAndUpdate.backup[env];
                //获取最后一个文件夹名
                const processName = path.basename(processPath);

                //2. 生成备份脚本
                const backupScriptTemp = "backup.sh";
                const scriptTargetPath = path.join(envTargetPath, backupScriptTemp)
                const backupScriptTempPath = path.join(__dirname, '../../template', backupScriptTemp)
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
                            const fullPath = path.join(dir, entry.name)
                            const relPath = relativePath ? path.posix.join(relativePath, entry.name) : entry.name

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
                /**
                 * 更新脚本和备份脚本在相同路径下面
                 * 更新脚本所在的文件夹有一个更新包名称是sourceDirName
                 * 更新脚本的功能是将更新包的文件更新到processPath
                 * 更新脚本需要将更新包的每个文件和processPath 的对应文件进行比较，在日志中记录是修改的还是新增的。
                 * 更新脚本可以参考备份脚本进行实现
                 * 更新脚本模板是template\update.sh
                 */

            }

            // 所有操作成功，将临时目录移动到目标位置
            for (const dir of createdDirs) {
                const finalPath = path.join(targetPath, path.basename(dir))
                fs.moveSync(dir, finalPath, { overwrite: true })
            }
            fs.removeSync(tempDir)

            success = true
            return { success: true, message: '打包文件生成成功' }
        } catch (error) {
            console.error('生成打包文件失败:', error)
            // 回滚：删除已创建的目录
            try {
                for (const dir of createdDirs) {
                    if (fs.existsSync(dir)) fs.removeSync(dir)
                }
                if (fs.existsSync(tempDir)) fs.removeSync(tempDir)
            } catch (cleanupError) {
                console.error('清理临时文件失败:', cleanupError)
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

module.exports = ConfigManager