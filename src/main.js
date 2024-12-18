import { createApp } from 'vue';
import App from './App.vue';
import router from './routers'; // 引入router
import ElementPlus from 'element-plus' 
import 'element-plus/dist/index.css'   
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/theme.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const showMessage = (message, type = 'info') => {
  ElMessage({
    message,
    type,
    position: 'top-center',
    duration: 2000,
    zIndex: 20000
  })
}

app.use(ElementPlus, {
  // Element Plus 的全局配置
  message: {
    position: 'top-center',
    duration: 2000,
    zIndex: 20000
  }
})

app.use(router)
app.mount('#app')