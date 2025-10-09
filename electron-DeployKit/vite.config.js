import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [
        vue({
            reactivityTransform: true,
            template: {
                // 确保Vue模板也能热更新
                compilerOptions: {
                    hmr: true
                }
            }
        }),
        electron({
            entry: fileURLToPath(new URL('./src/main/main.js', import.meta.url)),
            onstart(args) {
                args.startup(['.', '--remote-debugging-port=9223'])
            },
            // 启用Vite开发服务器
            vite: {
                server: {
                    hmr: true
                }
            }
        }),
        AutoImport({
            resolvers: [ElementPlusResolver()],
            dts: 'src/auto-imports.d.ts'
        }),
        Components({
            resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
            dts: 'src/components.d.ts'
        }),
    ],
    /**
     * base: './' 表示：打包后的所有资源（JS、CSS、图片等）都使用「相对于当前 HTML 文件所在目录」的路径来引用。
     * base 决定了 HTML 里 <script> 和 <link> 的 src/href 是怎么写的，而这个写法必须和你实际部署的文件结构匹配，否则资源就加载失败！
     */
    base: './',
    /**
     * 根路径
     * import.meta.url 是 ES 模块标准（ES2020）提供的元属性。它返回 当前模块文件的绝对 URL 路径。例子file:///Users/yourname/my-project/vite.config.js
     * new URL(relativePath, baseURL) 会返回一个新的 URL 对象，表示拼接后的绝对路径 file:///Users/yourname/my-project/src/renderer
     * fileURLToPath 是 Node.js 内置工具函数（来自 url 模块），作用是：把 file://... 格式的 URL 转换成本地文件系统路径。
     * 
     * __dirname  是 CommonJS的当前文件目录 ES不可用
     */
    root: fileURLToPath(new URL('./src/renderer', import.meta.url)),
    server: {
        port: 3000,
        sourcemap: true,
        hmr: {
            // 显式启用HMR
            protocol: 'ws',
            host: 'localhost',
            port: 3000,
            // 对于Electron应用，需要覆盖默认的客户端路径
            clientPort: 3000
        },
        // 监听文件变化
        watch: {
            usePolling: true,
            interval: 100
        }
    },
    build: {
        // 输出路径
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        // 关闭清空输出目录警告的
        emptyOutDir: true,
        sourcemap: true,
        // 设置为 false 可以禁用最小化混淆
        minify: false
    },
    // 别名 目前只有@别名ts人其它的别名ts会有红色波浪线
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src/renderer', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/renderer/components', import.meta.url)),
            '@views': fileURLToPath(new URL('./src/renderer/views', import.meta.url)),
            '@types': fileURLToPath(new URL('./src/renderer/types', import.meta.url))
        }
    },
    // 样式预处理器 该选项可以用来为每一段样式内容添加额外的代码。但是要注意，如果你添加的是实际的样式而不仅仅是变量，那这些样式在最终的产物中会重复。
    // 所以，建议只用它来添加变量。 下划线开头表示“部分文件”，不会单独编译
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/_variables.scss" as *;`
            }
        }
    }
})
