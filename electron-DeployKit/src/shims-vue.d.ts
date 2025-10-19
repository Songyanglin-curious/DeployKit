// src/shims-vue.d.ts
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// Extend Window interface with electronAPI
interface Window {
    electronAPI: any;
}
