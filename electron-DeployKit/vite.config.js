import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig({
    plugins: [
        vue(),
        electron({
            entry: 'src/main/main.js',
        })
    ],
    base: './',
    root: path.join(__dirname, 'src/renderer'),
    server: {
        port: 3000,
    },
    build: {
        outDir: path.join(__dirname, 'dist'),
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src/renderer'),
            '@components': path.join(__dirname, 'src/renderer/components'),
            '@views': path.join(__dirname, 'src/renderer/views')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {

                // 现代 Sass 推荐使用 @use，也可写成：
                additionalData: `@use "@/styles/variables.scss" as *;`
            }
        }
    }
})
