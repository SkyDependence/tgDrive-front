import { createRouter, createWebHistory } from 'vue-router';

// 导入您的路由页面
import Upload from '../views/UploadPage.vue';
import Home from '../views/Home.vue';
import FileList from '../views/FileList.vue';
import Login from '../views/LoginPage.vue'; // 登录页面
import Layout from '@/components/Layout.vue';
import AdminLayout from '@/components/AdminLayout.vue';

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                component: Upload,
            },
            {
                path: 'login',
                component: Login,
            }
        ]
    },

    {
        path: '/',
        component: AdminLayout,
        children: [
            {
                path: 'home',
                component: Home,
                meta: {
                    requiresAuth: true,
                }
            },
            {
                path: 'fileList',
                component: FileList,
                meta: {
                    requiresAuth: true,
                }
            }
        ]
    },
    { path: '/login', component: Login }, // 登录页面不需要登录
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.meta.requiresAuth && !token) {
        next('/login'); // 如果未登录，跳转到登录页面
    } else {
        next(); // 否则放行
    }
});

export default router;
