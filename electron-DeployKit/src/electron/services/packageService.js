import { app, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename, posix } from 'node:path'
import fs from 'fs-extra'

import log from 'electron-log'
import { PATHS } from '../config/path'
import { formatPath } from '../utils/path'
/**
 * 生成打包文件
 * 
 * @param {string} sourcePath - 源路径，包含项目文件的目录
 * @param {string} targetPath - 目标路径，用于存放生成的打包文件的目录
 * @param {string} projectName - 项目名称
 * @param {Object} config - 配置对象，包含生成打包文件所需的配置信息
 * @returns {boolean} - 如果生成成功返回 true，否则返回 false
 */
export async function generatePackage(sourcePath, targetPath, projectName, config) {
    log.info('开始生成打包文件')

    const sourceDirName = basename(sourcePath);
    const tempDir = join(targetPath, `temp_${Date.now()}`);
    const createdDirs = []
    let success = false

    try {
        // 确保临时目录存在
        fs.ensureDirSync(tempDir)

        // 1. 创建目标文件夹结构（先在临时目录中操作）

        for (const env of config.envs) {
            const envTargetPath = join(
                tempDir,
                `${projectName}_${env}`
            )
            fs.ensureDirSync(envTargetPath)
            createdDirs.push(envTargetPath)

            // 拷贝sourcePath文件夹到envTargetPath
            const sourceFolderName = basename(sourcePath)
            const targetFolderPath = join(envTargetPath, sourceFolderName)
            fs.copySync(sourcePath, targetFolderPath)

            const haveBin = config?.Bin[env] || false;

            // 获取配置文件中的环境变量
            const updatePath = formatPath(config.backupAndUpdate.update[env]);
            const backupPath = formatPath(config.backupAndUpdate.backup[env]);
            //获取更新目标程序的根路径
            const updateName = basename(updatePath);

            //2. 生成备份脚本
            const backupFileName = "backup.sh";
            const backupTargetPath = join(envTargetPath, backupFileName)
            const backupTemplatePath = join(PATHS.TEMPLATES, backupFileName)
            if (fs.existsSync(backupTemplatePath)) {
                let content = fs.readFileSync(backupTemplatePath, 'utf8')
                // 注入环境变量并确保跨平台路径
                content = content.replace("{BACKUP_PATH}", backupPath)
                content = content.replace("{UPDATE_PATH}", updatePath)
                content = content.replace("{UPDATE_NAME}", updateName)

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
                            // 如果relPath是以bin开头的 同时 haveBin 为true 则传入两份路径
                            if (haveBin && relPath.startsWith('bin')) {
                                const BinPath = relPath.replace('bin', 'Bin');
                                filesToBackup.push(relPath);
                            }
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

                fs.writeFileSync(backupTargetPath, content, { encoding: 'utf8' })
                fs.chmodSync(backupTargetPath, 0o755)
            }

            //3、生成更新脚本
            const updateFileName = "update.sh";
            const updateTargetPath = join(envTargetPath, updateFileName)
            const updateTemplatePath = join(PATHS.TEMPLATES, updateFileName)
            if (fs.existsSync(updateTemplatePath)) {
                let content = fs.readFileSync(updateTemplatePath, 'utf8')
                // 注入环境变量并确保跨平台路径
                content = content.replace(/{UPDATE_PATH}/g, updatePath)
                content = content.replace(/{UPDATE_NAME}/g, updateName)
                content = content.replace(/{PACKAGE_NAME}/g, sourceDirName)
                // 添加HAVE_BIN变量
                content = content.replace(/{HAVE_BIN}/g, haveBin ? 'true' : 'false')

                fs.writeFileSync(updateTargetPath, content, { encoding: 'utf8' })
                fs.chmodSync(updateTargetPath, 0o755)
            }

            //4、生成还原脚本
            const restoreFileName = "restore.sh";
            const restoreTargetPath = join(envTargetPath, restoreFileName)
            const restoreTemplatePath = join(PATHS.TEMPLATES, restoreFileName)
            if (fs.existsSync(restoreTemplatePath)) {
                let content = fs.readFileSync(restoreTemplatePath, 'utf8')
                fs.writeFileSync(restoreTargetPath, content, { encoding: 'utf8' })
                fs.chmodSync(restoreTargetPath, 0o755)
            }

            // 生成部署脚本
            const deployFileName = "deploy.sh";
            const deployTargetPath = join(envTargetPath, deployFileName)
            const deployTemplatePath = join(PATHS.TEMPLATES, deployFileName)
            if (fs.existsSync(deployTemplatePath)) {
                let content = fs.readFileSync(deployTemplatePath, 'utf8')
                fs.writeFileSync(deployTargetPath, content, { encoding: 'utf8' })
                fs.chmodSync(deployTargetPath, 0o755)
            }

        }

        // 所有操作成功，将临时目录移动到目标位置
        for (const dir of createdDirs) {
            const finalPath = join(targetPath, basename(dir))
            fs.moveSync(dir, finalPath, { overwrite: true })
        }
        fs.removeSync(tempDir)
        return { success: true, message: '打包文件生成成功', state: "success" }
    } catch (error) {
        log.error('生成打包文件失败:', error)
        // 回滚：删除已创建的目录
        try {
            for (const dir of createdDirs) {
                if (fs.existsSync(dir)) fs.removeSync(dir)
            }
            if (fs.existsSync(tempDir)) fs.removeSync(tempDir)
        } catch (cleanupError) {
            log.error('清理临时文件失败:', cleanupError)
        }
        throw new Error(`打包文件生成失败: ${error.message}`);
    }
}