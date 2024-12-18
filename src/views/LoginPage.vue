<template>
	<div class="login-container">
		<el-card class="login-card">
			<template #header>
				<h2 class="login-title">欢迎登录</h2>
			</template>

			<el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top" @keyup.enter="handleLogin">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="loginForm.username" :prefix-icon="User" placeholder="请输入用户名" clearable
						@keyup.enter="$refs.passwordInput.focus()" />
				</el-form-item>

				<el-form-item label="密码" prop="password">
					<el-input ref="passwordInput" v-model="loginForm.password" :prefix-icon="Lock" type="password"
						placeholder="请输入密码" show-password clearable />
				</el-form-item>

				<div class="login-options">
					<el-checkbox v-model="rememberMe">记住我</el-checkbox>
					<el-link type="primary">忘记密码？</el-link>
				</div>

				<el-form-item>
					<el-button type="primary" @click="handleLogin" :loading="loading" class="login-button" round block>
						{{ loading ? '登录中...' : '登录' }}
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const loginForm = ref({
	username: '',
	password: ''
})
const loginFormRef = ref(null)
const passwordInput = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const rules = {
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
	loginFormRef.value.validate(async (valid) => {
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
				}
				showMessage(response.data.msg || '登入成功', 'success')
				router.push('/home')
			} else {
				showMessage(response.data.msg, 'error')
			}
		} catch (error) {
			console.error('登录出错', error)
			showMessage('登入失败' + error, 'error')
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

// 初始化时检查是否有保存的用户名
const initSavedUsername = () => {
	const savedUsername = localStorage.getItem('username')
	if (savedUsername) {
		loginForm.value.username = savedUsername
		rememberMe.value = true
	}
}

initSavedUsername()
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--background-color);
}

.login-card {
	width: 420px;
	backdrop-filter: blur(10px);
	background: var(--container-bg-color);
	border: none;
	border-radius: 16px;
	box-shadow: 0 8px 24px var(--box-shadow-color);
	transition: all 0.3s ease;
}

.login-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 12px 28px var(--box-shadow-color);
}

.login-title {
	text-align: center;
	color: var(--text-color);
	font-size: 24px;
	margin: 0;
	padding: 10px 0;
}

.login-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
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
