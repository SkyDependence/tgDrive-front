import { createApp } from 'vue';
import App from './App.vue';
import router from './routers'; // 引入router
import ElementPlus from 'element-plus' 
import 'element-plus/dist/index.css'   
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/theme.css';

const app = createApp(App)

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