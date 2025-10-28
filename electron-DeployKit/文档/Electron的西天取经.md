# Electron 的西天取经

> 我本身是做 Web 开发的，最近需要写个小工具，调用一些系统 API，就选择了比较成熟的 Electron。结果业务代码写了三小时，环境配置、镜像、文件引用、打包路径、体积过大、文件被锁定……各种问题却折腾了将近三天。写下这篇笔记，记录这一路的坎坷。

## 第一难：官方文档搭不起项目

按照官方说明初始化项目：

```
npm init
npm install electron --save-dev
```

结果第一步就卡住了——**装不上**。

初步猜测是网络问题。虽然开梯子能解决，但不想一直挂着。查阅文档后发现，Electron 在国内需要配置镜像。

于是动手配置：

1. 找到 `.npmrc` 文件，路径可通过 `npm config list` 查看 `user` 字段；
2. 加入镜像地址：`electron_mirror=https://npmmirror.com/mirrors/electron/`

**小结**

国内开发环境配置镜像算是常规操作，只是初次接触时容易让人心烦。

## 第二难：引入 Vue 与 Vite

官方示例虽然能运行，但没有热更新，开发效率低。既然选择了 Electron，自然要利用前端生态，于是决定引入 Vue 和 Vite，配合 `vite-plugin-electron` 替换原有结构。

思维方式需要转变：原本是加载本地 HTML 文件，现在则要加载 Vite 启动的本地服务：`win.loadURL('http://localhost:3000')`。

另一个问题是开发环境与生产环境的差异，需要引入环境变量。最终使用 `cross-env` 实现：

```json
"dev": "cross-env NODE_ENV=development vite dev",
```

**小结**

逻辑上并不复杂，关键在于理解 Electron 分为主进程与渲染进程，最终前端跑的还是编译后的 HTML 与 JS。理清整个流程后，内部实现就可以灵活替换。

## 第三难：如何调试？

页面跑起来了，但怎么打开开发者工具？后端代码如何打断点？

首先在创建 `BrowserWindow` 时加上：

```js
win.webContents.openDevTools({ mode: 'detach' })
```

这样启动时就会自动打开调试工具。如果不小心关掉了，还可以用 `Ctrl + Shift + I` 重新打开。

主进程调试需要在 VSCode 中配置 `launch.json`，虽然不复杂，但配置起来略繁琐：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Electron with Vite",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "windows": {
                "runtimeExecutable": "npm.cmd"
            },
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "skipFiles": ["<node_internals>/**"],
            "env": {
                "NODE_ENV": "development",
                "ELECTRON_IS_DEV": "true"
            }
        },
        {
            "name": "Attach to Renderer",
            "type": "chrome",
            "request": "attach",
            "port": 9223,
            "url": "http://localhost:3000",
            "webRoot": "${workspaceFolder}/src/renderer",
            "sourceMaps": true,
            "sourceMapPathOverrides": {
                "/@fs/*": "${webRoot}/*",
                "/@id/*": "${webRoot}/*",
                "/src/*": "${webRoot}/*",
                "/node_modules/.vite/*": "${webRoot}/node_modules/*"
            }
        }
    ],
    "compounds": [
        {
            "name": "Debug Main + Renderer",
            "configurations": ["Debug Electron with Vite", "Attach to Renderer"]
        }
    ]
}
```

同时 Vite 配置也要配合调整端口与调试参数。

**小结**

前端调试工具的打开方式藏在文档深处，最后还是靠博客文章才找到；主进程调试则要配置 VSCode 和 Vite 插件，整套流程配下来，比写业务逻辑还耗时。

## 第四难：electron-forge 打包初体验

一开始使用的是官方推荐的 `electron-forge`，但体验并不理想：

1. 直接生成 exe，没有安装引导，也没有卸载入口；
2. 双击直接运行，还会附带一个无说明的更新进程；
3. 配置引导进程不生效；
4. 内存占用高达 600MB，明显是把 node_modules 全打包了；
5. 中文文件名在安装后变成乱码；
6. 打包时 asar 文件被占用，必须杀掉所有 Electron 进程才能继续。

**小结**

或许是我没配置对，但整体使用体验确实不佳。

## 第五难：electron-builder 打包卡在下载

于是换用 `electron-builder`，结果打包时卡在三个依赖包的下载：

- winCodeSign-2.6.0
- nsis-3.0.4.1
- nsis-resources-3.4.1

又是网络问题。有两种解决办法：

**手动下载并放置缓存**

将下载的包解压到以下路径：

```
C:\Users\15034\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0
C:\Users\15034\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1
C:\Users\15034\AppData\Local\electron-builder\Cache\nsis\nsis-resources-3.4.1\plugins
```

**配置镜像**

在 `.npmrc` 中加入：

```
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

## 第六难：打包流程未完成

打包过程没有报错，但 release 文件夹没有生成，流程未完整执行。

排查后发现，主进程入口不是 `./dist/main/main.js`，而是由 Vite 插件控制的 `./dist-electron/main.js`。

**小结**

入口路径的理解偏差，让成功只差一步，却耗费不少时间。

## 第七难：打包时文件被占用

又遇到文件占用错误：

```
EBUSY: resource busy or locked, unlink '.../dist/win-unpacked/resources/app.asar'
```

原因是 `vite build` 和 `electron-builder` 同时操作 `dist/` 目录，导致文件被锁定。

解决方案是让它们使用不同的输出目录。修改 Vite 配置：

```js
outDir: fileURLToPath(new URL('./renderer-dist', import.meta.url))
```

同时调整 `electron-builder.config.js` 中的 `files` 配置：

```js
files: ['renderer-dist/**/*', ...]
```

但打包后仍然没有生成 release 文件夹，日志显示输出在 `dist\electron-deploykit Setup 0.0.1.exe`，似乎配置文件未生效。

检查 `dist\builder-effective-config.yaml`，确认配置未加载。尝试修改配置文件名、加入日志打印、甚至回退版本，均无效。

最后将配置文件改为 `electron-builder.config.yml`，居然成功了。

## 第八难：包体积过大

一个简单页面打包后居然占用了 700MB。

将 `asar` 设为 `false` 后，发现果然是 `node_modules` 被全部打包。于是在配置中将其排除：

```yaml
files:
  - ./renderer-dist/**/*
  - ./dist-electron/**/*
  - ./package.json
  - '!./**/*.map'
  - '!node_modules/**/*'
```

## 第九难：ESM 与 CommonJS 模块冲突

打包安装后程序无法启动，日志显示模块引用错误。由于代码被压缩，难以定位问题。

取消压缩后，发现是 `const windowManager = require('/windowManager')` 这种 CommonJS 写法在 Vite 中不被支持。

Electron 官方示例使用 CommonJS，但 Vite 默认使用 ESM。最终将所有模块改为 ESM 写法。

也可尝试使用 `vite-plugin-commonjs` 插件转换，但我没有实际验证。

## 第十难：preload.js 未被打包

开发环境运行时出现错误：

```
Unable to load preload script: D:\code\DeployKit\electron-DeployKit\preload.js
Error: ENOENT: no such file or directory, open 'D:\code\DeployKit\electron-DeployKit\preload.js'
```

检查发现 `dist-electron` 下没有 `preload.js`。

于是在 Vite 配置中加入自定义插件，手动复制 preload 文件：

```js
function copyPreloadPlugin() {
    return {
        name: 'copy-preload',
        closeBundle() {
            const src = fileURLToPath(new URL('./src/main/preload.js', import.meta.url))
            const destDir = fileURLToPath(new URL('./dist-electron', import.meta.url))
            const dest = join(destDir, 'preload.js')

            if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
            copyFileSync(src, dest)
            console.log('✅ Copied preload.js to dist-electron')
        }
    }
}
```

在 plugins 中启用：

```js
plugins: [
    // ...
    copyPreloadPlugin()
]
```

**备注**

> Electron 主进程可以使用 ESM，但 preload.js 必须使用 CommonJS（require），并且必须确保它被正确复制到输出目录。

## 其他

### powershell 不能执行npm 命令

> 由于powershell 执行策略限制不能执行npm命令

解决方案：修改策略

* 在打开的窗口中，你可以先输入 `Get-ExecutionPolicy` 查看当前策略，通常会是 `Restricted`（禁止所有脚本）。
* 然后输入核心命令：`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。
* 完成后，可以再次输入 `Get-ExecutionPolicy` 检查是否已变为 `RemoteSigned`，此时就可以执行命令了。

## 总结

Electron 在开发环境下逻辑清晰，编写方便；但打包、工具链配置等方面却相当繁琐，相当于手动组装一套完整的构建流程。
