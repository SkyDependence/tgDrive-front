<!-- src/components/SimpleLayout.vue -->
<template>
  <el-container class="layout-container">
    <el-header>
      <el-row justify="space-between" align="middle">
        <el-col :span="12">
          <h2>tgDrive</h2>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-space>
						<el-button type="primary" @click="goToAdmin">管理界面</el-button>
            <el-button type="primary" @click="goToLogin">登录</el-button>
						<el-switch
              v-model="isDarkMode"
              active-text="暗色"
              inactive-text="亮色"
              @change="toggleTheme"
            />
          </el-space>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const goToLogin = () => {
  router.push('/login')
}

const goToAdmin = () => {
  router.push('/home')
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
}

initTheme()
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  padding: 0 20px;
}

.el-main {
  padding: 20px;
}
</style>
