<template>
  <div class="change-password-container">
    <el-card class="change-password-card">
      <template #header>
        <h2 class="change-password-title">修改密码</h2>
      </template>

      <el-form :model="passwordForm" :rules="rules" ref="passwordFormRef" label-position="top"
        @keyup.enter="changePassword">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="passwordForm.username" :prefix-icon="User" placeholder="请输入用户名"
            clearable />
        </el-form-item>

        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" :prefix-icon="Lock" type="password" placeholder="请输入旧密码"
            show-password clearable />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" :prefix-icon="Lock" type="password" placeholder="请输入新密码"
            show-password clearable />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" :prefix-icon="Lock" type="password" placeholder="请再次输入新密码"
            show-password clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="changePassword" :loading="loading" class="change-password-button" round
            block>
            {{ loading ? '修改中...' : '修改密码' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import request from '../utils/request'

const passwordForm = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordFormRef = ref(null)
const loading = ref(false)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const changePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await request.post('/auth/change-password', {
        username: passwordForm.value.username,
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      })

      if (response.data.code === 1) {
        showMessage('密码修改成功', 'success')
        passwordForm.value = { username: '', oldPassword: '', newPassword: '', confirmPassword: '' }
      } else {
        showMessage(response.data.msg || '密码修改失败', 'error')
      }
    } catch (error) {
      console.error('修改密码失败', error)
      showMessage('修改密码失败：' + error.message, 'error')
    } finally {
      loading.value = false
    }
  })
}

const showMessage = (message, type = 'info') => {
  ElMessage({
    message,
    type,
    position: 'top-center',
    duration: 2000,
    zIndex: 20000
  })
}
</script>

<style scoped>
.change-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--container-bg-color);
}

.change-password-card {
  width: 420px;
  backdrop-filter: blur(10px);
  background: var(--container-bg-color);
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 24px var(--box-shadow-color);
  transition: all 0.3s ease;
}

.change-password-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px var(--box-shadow-color);
}

.change-password-title {
  text-align: center;
  color: var(--text-color);
  font-size: 24px;
  margin: 0;
  padding: 10px 0;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px var(--box-shadow-color);
  border-radius: 8px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 12px var(--box-shadow-color);
}

:deep(.el-button) {
  height: 44px;
  font-size: 16px;
}

:deep(.el-form-item__label) {
  color: var(--text-color);
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--hover-bg-color);
}
</style>
