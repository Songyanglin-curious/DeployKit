import { app, BrowserWindow, Menu } from 'electron'
import log from 'electron-log'
import fs from 'fs-extra'
import path from 'node:path'
import { pathConfig, PATHS } from './config/path'
// 初始化配置目录
export function initializeApp() {
    // 创建配置目录
    if (!fs.existsSync(PATHS.CONFIGS)) {
        // 将安装包下的配置文件夹复制到resources目录下
        try {
            fs.copySync(path.join(pathConfig.processResources, 'configs'), PATHS.CONFIGS)
        } catch (err) {
            log.error('初始化模板拷贝失败', err)
        }
    }
}
// 菜单中文化
function menuI18n() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '退出',
                    accelerator: 'CommandOrControl+Q',
                    click: () => {
                        app.quit()
                    }
                }
            ]

        }
    ]
}

export function setupChineseMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click() {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '重新加载',
                    accelerator: 'Ctrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    }
                },
                {
                    label: '强制重新加载',
                    accelerator: 'Ctrl+Shift+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    }
                },
                {
                    label: '切换开发者工具',
                    accelerator: 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.toggleDevTools()
                    }
                },
                { type: 'separator' },
                {
                    label: '实际大小',
                    accelerator: 'Ctrl+0',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.setZoomLevel(0)
                    }
                },
                {
                    label: '放大',
                    accelerator: 'Ctrl+=',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.setZoomLevel(
                            focusedWindow.webContents.getZoomLevel() + 1
                        )
                    }
                },
                {
                    label: '缩小',
                    accelerator: 'Ctrl+-',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.setZoomLevel(
                            focusedWindow.webContents.getZoomLevel() - 1
                        )
                    }
                },
                { type: 'separator' },
                {
                    label: '切换全屏',
                    accelerator: 'F11',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                    }
                }
            ]
        },
        {
            label: '窗口',
            submenu: [
                {
                    label: '最小化',
                    accelerator: 'Ctrl+M',
                    role: 'minimize'
                },
                {
                    label: '关闭',
                    accelerator: 'Ctrl+W',
                    role: 'close'
                }
            ]
        }
    ]

    // 构建菜单
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
