<!-- src/components/Layout.vue -->
<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="header-logo">
        <span class="logo-text">管理页面</span>
      </div>
      <div class="header-actions">
        <el-switch
          v-model="isDarkMode"
          active-icon-class="sun"
          inactive-icon-class="moon"
          active-text="亮色"
          inactive-text="暗色"
          @change="toggleTheme"
          class="theme-switch"
        />
      </div>
    </el-header>
    
    <el-container class="main-container">
      <el-aside width="250px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleSelect"
        >
          <el-menu-item index="/home" class="menu-item">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/fileList" class="menu-item">
            <el-icon><Folder /></el-icon>
            <span>文件列表</span>
          </el-menu-item>
          <el-menu-item index="/changePassword" class="menu-item">
            <el-icon><EditPen /></el-icon>
            <span>修改密码</span>
          </el-menu-item>
          <el-menu-item index="/" class="menu-item">
            <el-icon><Top /></el-icon>
            <span>上传文件</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Folder, Top } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

const isDarkMode = ref(false)

const toggleTheme = () => {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const detectSystemTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  isDarkMode.value = prefersDark.matches
  toggleTheme()
  
  prefersDark.addEventListener('change', (e) => {
    isDarkMode.value = e.matches
    toggleTheme()
  })
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    toggleTheme()
  } else {
    detectSystemTheme()
  }
})

// 菜单选择处理
const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: var(--background-color);
  transition: all 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: var(--container-bg-color);
  box-shadow: 0 2px 12px var(--box-shadow-color);
  backdrop-filter: blur(10px);
}

.header-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-switch {
  --el-switch-on-color: #409EFF;
  --el-switch-off-color: #6b7280;
  transition: all 0.3s ease;
}

.sidebar {
  background: var(--container-bg-color);
  border-right: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px var(--box-shadow-color);
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.menu-item {
  height: 56px;
  line-height: 56px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: var(--hover-bg-color);
}

.menu-item.is-active {
  background: var(--active-menu-bg);
  color: var(--active-menu-color);
  font-weight: 500;
}

.menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
}

.main-content {
  background: var(--background-color);
  padding: 24px;
  transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
