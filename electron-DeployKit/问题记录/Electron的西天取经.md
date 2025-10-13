# Electron的西天取经

> 本人由于是做web的，最近想写点小工具需要用到一些系统API就选择了比较成熟的Electron结果业务写了三小时各种环境配置、镜像、文件引不进去，打包配置有问题，路径不对，包体积过大，打包时文件被锁定等等等等折腾了我将近3天才搞定。写这篇笔记以记录这一路的磨难。

## 第一难：按照官方文档搭建项目搭不起来

运行以下的命令初始化项目：

```
npm init
npm install electron --save-dev
```

然后问题就来了，**装不上**。
此时还不知道问题所在，初步猜测是国内网络的问题，解决方案就是开梯子，但是我不想一直开梯子开发，然后就查文档在[安装指导 | Electron自定义镜像和缓存](https://www.electronjs.org/zh/docs/latest/tutorial/installation#%E8%87%AA%E5%AE%9A%E4%B9%89%E9%95%9C%E5%83%8F%E5%92%8C%E7%BC%93%E5%AD%98)发现了electron要配置镜像。

那就配置吧

1. 找到 `.npmrc`文件  通过 `npm config list`命令找到返回里面的 `user`字段就是本机npm配置文件所在
2. 在里面写入 `electron_mirror=https://npmmirror.com/mirrors/electron/` Electron镜像配置好了

**小结**

其实这个问题在国内开发很常见，就是配置镜像有时会让人很心烦。

## 第二难：引入vue和vite

项目搭建完成后，按照官方的文档一步步完成了最初的项目搭建，这一步官方文档还是不错的给的例子都能跑。

然后问题来了，官方给的例子没有热更新 用起来很不方便。官方给的例子是原生的页面开发效率比较低，我用Electron不就是为了前端生态吗，所以我要用vue来替换现有的页面开发，既然用了vue那么当然要用vite  既然用了vite那么当然要用 `vite-plugin-electron`一整套换掉。

因此问题来了 要转变思维方式 旧的方式是加载文件但是新的方式是加载vite给前端页面的 `win.loadURL('http://localhost:3000')`

还有 开发环境和打包后环境不一致  要引入环境变量然后对不同的环境做分发。于是要引入添加环境变量的方式 ，一圈搜索后确定通过 `cross-env`来实现 `"dev": "cross-env NODE_ENV=development vite dev",`

**小结**

其实这一步逻辑上来说不难，卡住的地方就是得一步步看文档还有得理解Electron是两个进程协调工作的，前端最终跑的还是编译后的html、js；还是回到了原本的Electron开发方式，就是得梳理清楚这整个关系，将整个过程抽象成一个接口流程，然后满足接口后里面的东西就可以随便改了。

## 第三难：如何debugger呢

现在页面跑起来了，但是前端开发工具怎么打开，后端的接口怎么打断点，没这些功能我完全无法开发。

首先先把前端页面的开发工具页面调出来，在初始化 `BrowserWindow`时加上 `win.webContents.openDevTools({ mode:'detach' })`在项目跑起来后就会直接打开，但是一部小心关掉了呢？这时需要一个快捷键来打开 `Ctrl + Shift + I` 。

然后就是后端了，后端我用的vscode就需要配置 `launch.json`这说难也不难就是挺烦的。

具体参考如下：

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

vite 配置也要对着配 `vite.config`

```js
electron({
            entry: fileURLToPath(new URL('./src/main/main.js', import.meta.url)),
            onstart(args) {
                args.startup(['.', '--remote-debugging-port=9223'])
            },
            vite: {
                build: {
                    minify: false,
                    rollupOptions: {
                        external: ['electron'],
                    },
                    assetsInclude: ['src/main/**/*'],
                    terserOptions: {
                        compress: false,
                        mangle: false,
                        keep_classnames: true,
                        keep_fnames: true
                    }
                },
                server: {
                    hmr: true
                }
            }
        }),
```

**小结**

前端渲染的开发工具配置就是得找，在官方文档里面翻起来挺费劲的，还是在别的博客里找到的；electron后端的debugger就是得折腾vscode的调试配置 还有vite插件，就这一整套整完比业务逻辑开发的时间都多了。

## 第四难：electron-forge 进行打包

最开始使用的是官方文档里面的 `electron-forge` 进行的打包，这个东西是官方推荐的但是啊并不好用，使用下来有以下的问题

1. 直接生成一个exe,然后直接安装没有安装引导，也没有卸载引导。
2. 双击一下程序页面直接出来了，并且还有一个只有色块没有文字说明的update进程也会跑。
3. 你配置它按照引导进程走不生效，反正我是没弄成功。
4. 运行后的内存占用非常大直接干到600MB ，基本可以确定是把node_modules干进去了。
5. 中文名称的文件在中间文件中是对的，安装后就成了乱码，试过几个解决方案没能成功的解决。
6. 还有 `asar`被占用，强制杀掉所有的Electron才成功打包。

**小结**

用它的体验不怎么好，当然也可能是我没用对。

## 第五难：electron-builder 进行打包下载文件卡住

`electron-forge` 用着不爽得换一个，后来我看 `CherryStudio`用的 `electron-builder` 就简单了解了一下，最终虽然成功打包但是整个过程也是颇为坎坷。

使用它打包结果被以下三个压缩包卡住

- winCodeSign-2.6.0
- nsis-3.0.4.1
- nsis-resources-3.4.1

得，又得查，查了半天又是网络的问题，后面两个解决办法

1. 手动下载解压
2. 配置镜像

**手动解压放缓存**

手动下载三个安装包分别按照以下路径放

```
C:\Users\15034\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0
C:\Users\15034\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1
C:\Users\15034\AppData\Local\electron-builder\Cache\nsis\nsis-resources-3.4.1\plugins
```

**配置镜像**

在 `.npmrc`文件里面写入

```
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

## 第六难：electron-builder 打包不成功

打包成功后的生成文件release没有成功生成，打包流程没有跑完。这个又是一点点的梳理结果是主程序入口不怎么对主程序的入口最开始是 `./dist/main/main.js`

而是插件控制的 ./dist-electron/main.js。

**小结**

这一步就是入口和插件默认行文的梳理，也挺耽搁时间的，距离成功一步之遥却在这里折磨人。

## 第七难：打包时出现文件占用

开开心心的打包结果又遇到了这个文件占用的报错，就挺恶心。

```
EBUSY: resource busy or locked, unlink '.../dist/win-unpacked/resources/app.asar'
```

这个查了之后发现是 `vite build` 和 `electron-builder` 同时操作 `dist/`，然后把文件给锁上了。

为了处理这个问题，就让它们别用同一个文件夹就行自己玩自己的.

将vite  的build 的 输出文件夹改了

`outDir:fileURLToPath(newURL('./renderer-dist', import.meta.url)),`

然后还有配置文件 `electron-builder.config.js` 里面的 `files`也需要改一下 `'renderer-dist/**/*',`

但是在执行打包后并没有生成 `release`输出文件夹

日志里面显示输出在 `dist\electron-deploykit Setup 0.0.1.exe ` 这就很诡异，感觉配置文件完全没有生效。
查看打包后的 `dist\builder-effective-config.yaml` 文件里面确实没有生效。
排除了

- 文件名不对
- 在自定义脚本中调用 builder.build()
- package.json 中有 build 字段

然后再 `electron-builder.config.js`中加入日志

```
console.log('electron-builder.config.js 被加载了！'); 
```

但是再打包后日志没有被打印，说明完全没有被加载。

然后将配置文件类型改为 `electron-builder.config.cjs` 也不行。

使用以下的测试命令打印的内容完全没有问题。

```
node -e "console.log(require('./electron-builder.config.js'))"
```

查看文件的权限也是完全没有问题，各种权限都有。

甚至在命令里面强行指定配置文件都不行 `electron-builder --config electron-builder.config.js`

怀疑是 `electron-builder`版本问题将版本回退到25，结果一模一样的不行。

就很恶心，不知道为啥我的环境上就是识别不到配置，然后突发奇想将配置文件改为yml，结果奇迹般的好了。

## 第八难：包体积过大

一个简单的页面安装后占用了700MB。

这个体积很不合理，最后的解决方案是将electron-builder配置的 `asar` 设置为 `false` 安装后能够看到打包进去的文件夹，里面有万恶之源 `node_modules`

然后在配置里面将它踢出去

```yaml
files:
  - ./renderer-dist/**/*
  - ./dist-electron/**/*
  - ./package.json
  - '!./**/*.map'
  - '!node_modules/**/*'
```

## 第九难：ESM模块和CommonJS模块

打包后对安装包进行了安装但是程序直接运行不起来，然后就是加一堆日志，最后在日志里面发现是模块引用出问题，但是此时的日志是压缩混淆后的完全不知道是哪个模块出问题，所以在 `electron-builder.yml`和 `vite.config.js`配置其不混淆压缩。

在不混淆压缩后发现是 `const windowManager = require('/windowManager')` CommonJS风格的引入vite没引进去。

Electron官方的例子是用的CommonJS方式引入，但是vite是用的EMS所以只能是将之前的CommonJS模块全改成EMS模块。幸运的是我的版本比较高ESM模块没问题。

当然 后来也查到可以用 `vite-plugin-commonjs`插件来处理CommonJS模块转换，但是我没有用过，不确定能不能行。

## 第十难：preload.js 没被打包到  `dist-electron`

一通改完后，开发环境运行都会出现

```
Unable to load preload script: D:\code\DeployKit\electron-DeployKit\preload.js
Error: ENOENT: no such file or directory, open 'D:\code\DeployKit\electron-DeployKit\preload.js'
```

预处理文件找不到 `dist-electron` 下面确实没有 `preload.js`

所以在 `vite.config.js` 加一个自定义组件

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

然后在plugins 中运行

```js
plugins: [
        ...
        copyPreloadPlugin()
    ],
```

**备注**

> Electron 的主进程可以用 ESM，但 preload.js 必须用 CommonJS（require），并且必须确保它被正确复制到构建输出目录。

## 总结

Electron 在开发环境下逻辑还算比较好理解也挺好写；但是打包、还有各种附加的工具、各种配置就很恶心了，相当于完全手动拼接了一套工具链。
