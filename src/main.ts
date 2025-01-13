import { createApp } from 'vue';
import type { App as AppType } from 'vue';
import App from './App.vue';
import router from './routers';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/theme.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const app: AppType = createApp(App);

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Global message function
const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info'): void => {
  ElMessage({
    message,
    type,
    duration: 2000,
    zIndex: 20000
  });
};

// Use Element Plus with configuration
app.use(ElementPlus, {
  message: {
    position: 'top-center',
    duration: 2000,
    zIndex: 20000
  }
});

// Use router
app.use(router);

// Mount the app
app.mount('#app');

// Export app instance for testing
export default app;
