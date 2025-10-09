const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        // 排除模板文件，使其不被打包进ASAR
        ignore: [
            path.join(__dirname, 'template'),
            path.join(__dirname, 'config')
        ],
        // 将模板文件复制到resources目录
        extraResource: [
            path.join(__dirname, 'template'),
            path.join(__dirname, 'config')
        ],
        // 禁用自动更新检查
        remoteReleases: false,
        checkForUpdates: false,
    },
    rebuildConfig: {},
    makers: [
        // Squirrel配置
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                authors: 'songyanglin',
                description: '更新包生成程序demo版本',
                setupIcon: path.join(__dirname, 'assets', 'icon.ico'),
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                runAfterFinish: false,
                remoteReleases: '',
                remoteToken: '',
                setupExe: 'DeployKitSetup.exe',
                noMsi: true,
                // 启用安装UI和目录选择
                customInstallSteps: {
                    install: '安装',
                    uninstall: '卸载',
                    close: '关闭',
                    cancel: '取消',
                    next: '下一步',
                    back: '上一步',
                    browse: '浏览...',
                    destination: '选择安装位置:',
                    createDesktopIcon: '创建桌面图标',
                    createStartMenuIcon: '创建开始菜单图标',
                    launchOnStartup: '开机自启动'
                },
                // 安装向导选项
                installerOptions: {
                    includeUninstaller: true,
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true
                }
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
