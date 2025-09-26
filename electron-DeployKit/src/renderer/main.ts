import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'

// 创建Vue应用
const app = createApp(App)

// 使用Naive UI
app.use(naive)

// 挂载应用
app.mount('#app')
