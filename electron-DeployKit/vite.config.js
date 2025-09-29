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
    base: './',
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
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        emptyOutDir: true,
        sourcemap: true,
        minify: false
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src/renderer', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/renderer/components', import.meta.url)),
            '@views': fileURLToPath(new URL('./src/renderer/views', import.meta.url)),
            '@types': fileURLToPath(new URL('./src/renderer/types', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/variables.scss" as *;`
            }
        }
    }
})
