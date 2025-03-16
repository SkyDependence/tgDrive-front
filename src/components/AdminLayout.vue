<!-- src/components/Layout.vue -->
<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="header-logo">
        <div class="logo-container">
          <el-icon class="toggle-sidebar" @click="toggleSidebar">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span class="logo-text" v-show="!isCollapsed">管理页面</span>
        </div>
      </div>
      <div class="header-actions">
        <el-tooltip
          effect="light"
          :content="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
          placement="bottom"
        >
          <div class="theme-switch-wrapper">
            <el-switch
              v-model="isDarkMode"
              @change="toggleTheme"
              class="theme-switch"
            />
            <el-icon class="theme-icon"><Sunny v-if="!isDarkMode" /><Moon v-else /></el-icon>
          </div>
        </el-tooltip>
        <el-avatar 
          class="user-avatar" 
          :size="32"
          src="https://placeholder.co/150"
          @click="goToLogin"
        />
      </div>
    </el-header>
    
    <el-container class="main-container">
      <el-aside :width="isCollapsed ? '64px' : '250px'" class="sidebar">
        <div class="menu-wrapper">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleSelect"
            :collapse="isCollapsed"
          >
            <el-menu-item index="/home" class="menu-item">
              <el-icon><HomeFilled /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/fileList" class="menu-item">
              <el-icon><Folder /></el-icon>
              <template #title>文件列表</template>
            </el-menu-item>
            <el-menu-item index="/changePassword" class="menu-item">
              <el-icon><EditPen /></el-icon>
              <template #title>修改密码</template>
            </el-menu-item>
            <el-menu-item index="/" class="menu-item">
              <el-icon><Top /></el-icon>
              <template #title>上传文件</template>
            </el-menu-item>
            <el-menu-item index="/backup" class="menu-item">
              <el-icon><Download /></el-icon>
              <template #title>备份数据库</template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      
      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  HomeFilled, 
  Folder, 
  Top, 
  Monitor,
  EditPen,
  Sunny,
  Moon,
  Expand,
  Fold,
  Download
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const isDarkMode = ref(false)
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarState', isCollapsed.value ? 'collapsed' : 'expanded')
}

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

const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    toggleTheme()
  } else {
    detectSystemTheme()
  }

  // 恢复侧边栏状态
  const savedSidebarState = localStorage.getItem('sidebarState')
  if (savedSidebarState) {
    isCollapsed.value = savedSidebarState === 'collapsed'
  }
})

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: var(--background-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: var(--container-bg-color);
  box-shadow: 0 2px 12px var(--box-shadow-color);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 10;
}

.header-logo {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-sidebar {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-color);
  transition: transform 0.3s ease;
}

.toggle-sidebar:hover {
  transform: scale(1.1);
}

.logo-icon {
  font-size: 24px;
  color: #409EFF;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-switch {
  --el-switch-on-color: #409EFF;
  --el-switch-off-color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon {
  font-size: 18px;
  color: var(--text-color);
}

.user-avatar {
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #409EFF;
  transform: scale(1.05);
}

.sidebar {
  background: var(--container-bg-color);
  border-right: 1px solid rgba(128, 128, 128, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px var(--box-shadow-color);
  position: relative;
  z-index: 5;
}

.menu-wrapper {
  padding: 16px 8px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.menu-wrapper::-webkit-scrollbar {
  width: 6px;
}

.menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 3px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.menu-item {
  height: 56px;
  line-height: 56px;
  margin: 8px 0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 16px;
}

.menu-item:hover {
  background-color: var(--hover-bg-color);
  transform: translateX(4px);
}

.menu-item.is-active {
  background: var(--active-menu-bg);
  color: var(--active-menu-color);
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.menu-item:hover .el-icon {
  transform: scale(1.1);
}

.main-content {
  background: var(--background-color);
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.content-wrapper {
  background: var(--container-bg-color);
  border-radius: 16px;
  padding: 24px;
  min-height: calc(100vh - 112px);
  box-shadow: 0 4px 16px var(--box-shadow-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
