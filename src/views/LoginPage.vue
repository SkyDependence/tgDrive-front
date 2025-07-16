<template>
  <div class="login-page-container">
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="28" color="var(--el-color-primary)"><Cloudy /></el-icon>
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">登录以继续使用 tgDrive</p>
      </div>

      <el-form 
        :model="loginForm" 
        :rules="rules" 
        ref="loginFormRef" 
        label-position="top" 
        @keyup.enter="handleLogin"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            :prefix-icon="User" 
            placeholder="请输入用户名" 
            size="large"
            clearable 
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            :prefix-icon="Lock" 
            type="password"
            placeholder="请输入密码" 
            size="large"
            show-password 
            clearable 
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" @click="forgotPassword">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading" 
            class="login-button"
            size="large"
            block
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { User, Lock, Cloudy } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: ''
})
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value?.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await request.post('/auth/login', {
        username: loginForm.value.username,
        password: loginForm.value.password
      })

      if (response.data.code === 1) {
        const userLogin = response.data.data
        localStorage.setItem('token', userLogin.token)
        localStorage.setItem('role', userLogin.role)

        if (rememberMe.value) {
          localStorage.setItem('username', loginForm.value.username)
        } else {
          localStorage.removeItem('username')
        }
        ElMessage.success(response.data.msg || '登录成功')
        router.push('/home')
      } else {
        ElMessage.error(response.data.msg || '登录失败')
      }
    } catch (error) {
      console.error('登录出错', error)
      ElMessage.error('登录失败，请检查网络或联系管理员')
    } finally {
      loading.value = false
    }
  })
}

const forgotPassword = () => {
  ElMessageBox.alert('请联系管理员重置您的密码。', '忘记密码', {
    confirmButtonText: '好的',
  })
}

onMounted(() => {
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    loginForm.value.username = savedUsername
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-page-container {
  display: flex;
  justify-content: center;
  align-items: center; /* Re-center vertically */
  min-height: 100vh;
  padding: 20px;
  overflow-y: auto; /* Ensure scrolling is possible if content overflows */
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 12px;
  background-color: var(--container-bg-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px var(--box-shadow-color);
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0 5px;
  color: var(--text-color);
}

.login-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.login-form .el-form-item {
  margin-bottom: 25px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
}

/* Responsive styles for LoginPage.vue */
@media (max-width: 767px) { /* Mobile breakpoint */
  .login-page-container {
    padding: 10px; /* Reduce overall padding */
  }

  .login-card {
    padding: 25px; /* Reduce card padding */
    border-radius: 8px; /* Slightly smaller border-radius */
  }

  .login-title {
    font-size: 22px; /* Slightly smaller title */
  }

  .login-subtitle {
    font-size: 13px; /* Slightly smaller subtitle */
  }
}

@media (max-width: 480px) { /* Smaller mobile breakpoint */
  .login-card {
    padding: 20px; /* Further reduce card padding for very small screens */
  }

  .login-title {
    font-size: 20px;
  }
}
</style>