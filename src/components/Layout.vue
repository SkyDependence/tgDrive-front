<!-- src/components/Layout.vue -->
<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon><Cloudy /></el-icon>
          <span>tgDrive</span>
        </div>
        <div class="actions">
          <el-dropdown @command="handleThemeCommand" trigger="click">
            <span class="el-dropdown-link" style="outline: none; cursor: pointer;">
              <el-icon :size="20"><component :is="themeIcon" /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="light" :icon="Sunny">亮色模式</el-dropdown-item>
                <el-dropdown-item command="dark" :icon="Moon">暗色模式</el-dropdown-item>
                <el-dropdown-item command="auto" :icon="Monitor">跟随系统</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" plain @click="goToAdmin">管理</el-button>
          <el-button type="primary" @click="goToLogin">登录</el-button>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Sunny, Moon, Cloudy, Monitor } from '@element-plus/icons-vue'

type Theme = 'light' | 'dark' | 'auto'

const router = useRouter()
const theme = ref<Theme>('auto')

// --- Theme Switching Logic ---
const themeIcon = computed(() => {
  if (theme.value === 'light') return Sunny
  if (theme.value === 'dark') return Moon
  return Monitor
})

const applyTheme = () => {
  if (theme.value === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.classList.toggle('dark', prefersDark.matches)
  } else {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }
}

const handleThemeCommand = (command: Theme) => {
  theme.value = command
  localStorage.setItem('theme', command)
  applyTheme()
}

const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
  if (theme.value === 'auto') {
    document.documentElement.classList.toggle('dark', e.matches)
  }
}

// --- Component Lifecycle ---
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as Theme | null
  theme.value = savedTheme || 'auto'
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', systemThemeChangeHandler)
})

onBeforeUnmount(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemThemeChangeHandler)
})

// --- Navigation Logic ---
const goToLogin = () => {
  router.push('/login')
}

const goToAdmin = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || userRole === 'visitor') {
    ElMessageBox.alert('您当前是访客，请使用管理员账号登录！', '权限提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
    return;
  }
  router.push('/home');
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--container-bg-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px; /* Or your preferred max-width */
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* You might want to wrap the router-view in a container */
:deep(.el-main > *) {
  width: 100%;
  max-width: 1200px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive styles for Layout.vue */
@media (max-width: 767px) { /* Mobile breakpoint */
  .header-content {
    padding: 0 10px; /* Reduce padding */
    flex-wrap: wrap; /* Allow items to wrap */
    justify-content: center; /* Center items if they wrap */
    gap: 10px; /* Add some gap when wrapped */
  }

  .logo {
    font-size: 18px; /* Smaller logo text */
  }

  .actions {
    gap: 8px; /* Smaller gap between action buttons */
    flex-wrap: wrap; /* Allow buttons to wrap */
    justify-content: center;
  }

  .main-content {
    padding: 10px; /* Reduce main content padding */
  }

  :deep(.el-main > *) {
    max-width: 100%; /* Allow content to take full width */
  }
}
</style>