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
  requiredRole?: 'admin' | 'visitor';
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        component: Upload,
        meta: {
          requiresAuth: true,
          requiredRole: 'visitor'
        } as RouteMeta
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
    meta: {
      requiresAuth: true,
      requiredRole: 'admin'
    } as RouteMeta,
    children: [
      {
        path: 'home',
        component: Home,
        meta: {
          requiresAuth: true,
          requiredRole: 'admin'
        } as RouteMeta
      },
      {
        path: 'fileList',
        component: FileList,
        meta: {
          requiresAuth: true,
          requiredRole: 'admin'
        } as RouteMeta
      },
      {
        path: 'changePassword',
        component: ChangePassword,
        meta: {
          requiresAuth: true,
          requiredRole: 'admin'
        } as RouteMeta
      },
    ]
  },
  { 
    path: '/login', 
    component: Login 
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  // 检查是否登录
  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }

  // 检查角色权限
  if (to.meta.requiredRole) {
    if (userRole === 'admin') {
      next();
    } else if (userRole === 'visitor' && to.meta.requiredRole === 'visitor') {
      next();
    } else {
      next('/'); // 无权限用户重定向到首页
    }
    return;
  }

  next();
});

export default router;
