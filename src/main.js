import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router';

// 导入您的路由页面
import Upload from './views/UploadPage.vue';
import Home from './views/Home.vue'

const routes = [
    { path: '/', component: Home }, // 根路径
    { path: '/upload', component: Upload },
    // 其他路由
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App)
    .use(router)
    .mount('#app')
