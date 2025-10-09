// electron-builder.config.js
const path = require('path');

/** @type {import('electron-builder').Configuration} */
const config = {
    // 应用基本信息
    appId: 'com.songyanglin.electron-deploykit',
    productName: 'DeployKit', // ← 安装后显示的名称（可中文，但建议英文避免乱码风险）
    copyright: 'Copyright © 2025 songyanglin',
    directories: {
        output: 'release', // 打包输出目录
    },

    // 主进程入口（已构建后的路径）
    main: './dist/main/main.js',

    // 要打包的文件（默认包含 package.json 和 main 指向的文件）
    files: [
        'dist/**/*',
        '!dist/**/*.map', // 排除 source map
    ],

    // ✅ 关键：部署额外资源文件（template/ 和 config/）
    extraResources: [
        {
            from: 'template/',
            to: 'template/',
            filter: ['**/*'],
        },
        {
            from: 'config/',
            to: 'config/',
            filter: ['**/*'],
        },
    ],

    // 启用 ASAR 压缩（减小体积）
    asar: true,

    // Windows 配置
    win: {
        target: 'nsis', // 使用 NSIS 生成安装程序
        icon: 'assets/icon.ico', // 应用图标
    },

    // NSIS 安装程序配置（解决你的中文、安装选项需求）
    nsis: {
        oneClick: false, // 显示安装向导（非静默）
        allowToChangeInstallationDirectory: true, // 允许用户选择安装路径
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        language: '2052', // ← 2052 = 简体中文（解决乱码！）
        deleteAppDataOnUninstall: true, // 卸载时清理用户数据
        installerIcon: 'assets/icon.ico',
        uninstallerIcon: 'assets/icon.ico',
        installerHeaderIcon: 'assets/icon.ico',
    },

    // macOS 配置（可选）
    mac: {
        target: 'dmg',
        icon: 'assets/icon.icns',
    },

    // Linux 配置（可选）
    linux: {
        target: 'AppImage',
        icon: 'assets/icon.png',
    },

    // 自动更新（可选，后续可集成 electron-updater）
    publish: null, // 暂时禁用
};

module.exports = config;
