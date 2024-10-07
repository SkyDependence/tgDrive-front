// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import UploadPage from '../views/UploadPage.vue';  // 导入 UploadPage 页面组件

const routes = [
    { path: '/', component: Home }, 
    { path: '/upload', component: UploadPage } // 上传页面的路由配置
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
