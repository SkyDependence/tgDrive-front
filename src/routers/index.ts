import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// 导入您的路由页面
import Upload from '../views/UploadPage.vue';
import Home from '../views/Home.vue';
import FileList from '../views/FileList.vue';
import Login from '../views/LoginPage.vue';
import Layout from '@/components/Layout.vue';
import AdminLayout from '@/components/AdminLayout.vue';
import ChangePassword from '@/views/ChangePassword.vue';

interface RouteMeta extends Record<string | number | symbol, unknown> {
  requiresAuth?: boolean;
}

const routes: Array<RouteRecordRaw> = [
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
        } as RouteMeta
      },
      {
        path: 'fileList',
        component: FileList,
        meta: {
          requiresAuth: true,
        } as RouteMeta
      },
      {
        path: 'changePassword',
        component: ChangePassword,
        meta: {
          requiresAuth: true,
        } as RouteMeta
      },
    ]
  },
  { 
    path: '/login', 
    component: Login 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
