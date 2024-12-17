<template>
  <div id="app">
    <router-view></router-view> <!-- 显示路由匹配的页面组件 -->
    <header>
      <el-switch 
        v-model="isDarkMode"
        active-text="暗色模式"
        inactive-text="亮色模式"
        @change="toggleTheme"
      />
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 是否为暗色模式
const isDarkMode = ref(false);

// 切换主题的方法
const toggleTheme = () => {
  const html = document.documentElement;
  if (isDarkMode.value) {
    html.classList.add('dark'); // 添加暗色主题类名
    localStorage.setItem('theme', 'dark'); // 持久化存储
  } else {
    html.classList.remove('dark'); // 移除暗色主题类名
    localStorage.setItem('theme', 'light');
  }
};

// 自动检测系统主题设置的方法
const detectSystemTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)'); // 系统是否为暗色
  isDarkMode.value = prefersDark.matches; // 初始化主题
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  // 监听系统主题变化
  prefersDark.addEventListener('change', (e) => {
    isDarkMode.value = e.matches;
    toggleTheme();
  });
};

// 页面加载时根据 localStorage 恢复主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
    toggleTheme();
  } else {
    detectSystemTheme(); // 如果没有用户设置，自动检测系统主题
  }
});
</script>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
</style>
