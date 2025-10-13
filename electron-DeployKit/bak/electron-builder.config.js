module.exports = {
    appId: 'com.songyanglin.electron-deploykit',
    productName: 'DeployKit',
    copyright: 'Copyright © 2025 songyanglin',

    directories: {
        output: 'release'
        // app: 'release-unpacked'
    },

    files: [
        './renderer-dist/**/*',
        './dist-electron/**/*',
        './package.json',
        '!./**/*.map',
        '!node_modules/**/*'
    ],

    extraResources: [
        {
            from: 'template/',
            to: 'template/'
        },
        {
            from: 'config/',
            to: 'config/'
        }
    ],

    asar: false,
    compression: 'store',
    asarUnpack: ['**/*'],

    win: {
        target: 'nsis'
        // icon: 'assets/icon.ico'
    },

    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        language: '2052',
        deleteAppDataOnUninstall: true
        // installerIcon: 'assets/icon.ico'
        // uninstallerIcon: 'assets/icon.ico'
        // installerHeaderIcon: 'assets/icon.ico'
    },

    mac: {
        target: 'dmg',
        icon: 'assets/icon.icns'
    },

    linux: {
        target: 'AppImage',
        icon: 'assets/icon.png'
    },

    publish: null
};