<template>
  <div class="config-container">
    <div class="form-wrapper">
      <div class="form-header">
        <h1>配置设置</h1>
        <p>设置您的Telegram bot</p>
      </div>

      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="120px"
        class="config-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-grid">
          <el-form-item label="配置名称" prop="name">
            <el-input 
              v-model="ruleForm.name" 
              placeholder="请输入配置文件名称" 
              clearable
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="bot token" prop="token">
            <el-input 
              v-model="ruleForm.token" 
              placeholder="请输入Telegram bot token" 
              clearable
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Chat ID" prop="target">
            <el-input 
              v-model="ruleForm.target" 
              placeholder="请输入Chat ID" 
              clearable
            >
              <template #prefix>
                <el-icon><ChatDotRound /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="URL（选填）" prop="url">
            <el-input 
              v-model="ruleForm.url" 
              placeholder="请输入URL" 
              clearable
            >
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码（选填）" prop="pass">
            <el-input 
              v-model="ruleForm.pass" 
              type="password" 
              placeholder="请输入密码" 
              show-password
              clearable
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button 
            type="primary" 
            native-type="submit" 
            class="submit-btn"
            :loading="isSubmitting"
          >
            提交配置
          </el-button>
          <el-button 
            plain 
            @click="resetForm" 
            class="reset-btn"
          >
            重置
          </el-button>
        </div>
      </el-form>

      <transition name="fade">
        <div v-if="message" class="message-box" :class="messageType">
          {{ message }}
        </div>
      </transition>
    </div>

    <div class="load-config-section">
      <h2>加载现有配置</h2>
      <div class="load-config-input">
        <el-input 
          v-model="configFilename" 
          placeholder="请输入配置名称" 
          clearable
        >
          <template #prefix>
            <el-icon><Folder /></el-icon>
          </template>
        </el-input>
        <el-button 
          type="primary" 
          @click="loadConfig" 
          class="load-btn"
          :loading="isLoading"
        >
          加载配置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  Document, 
  Key, 
  ChatDotRound, 
  Link, 
  Lock, 
  Folder 
} from '@element-plus/icons-vue';

const ruleFormRef = ref<FormInstance>();
const router = useRouter();

// 表单状态
const ruleForm = reactive({
  name: '',
  token: '',
  target: '',
  url: '',
  pass: '',
});

// 加载和消息状态
const isSubmitting = ref(false);
const isLoading = ref(false);
const message = ref('');
const messageType = ref('success');

const configFilename = ref('');

// 表单验证规则
const rules = reactive<FormRules>({
  name: [{ 
    required: true, 
    message: '请输入配置文件名称', 
    trigger: 'blur' 
  }],
  token: [{ 
    required: true, 
    message: '请输入Telegram机器人令牌', 
    trigger: 'blur' 
  }],
  target: [{ 
    required: true, 
    message: '请输入聊天ID', 
    trigger: 'blur' 
  }],
});

// 提交表单处理器
const handleSubmit = async () => {
  if (!ruleFormRef.value) return;

  isSubmitting.value = true;
  message.value = '';

  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = { ...ruleForm };
        const response = await axios.post('/api/config', payload);

        const { code, msg } = response.data;

        if (code === 1) {
          messageType.value = 'success';
          message.value = msg || '配置提交成功';
          
          // 提交成功后重置表单
          ruleFormRef.value.resetFields();
        } else {
          messageType.value = 'error';
          message.value = msg || '提交失败，请重试';
        }
      } catch (error) {
        messageType.value = 'error';
        message.value = error.response?.data?.msg 
          ? '提交失败: ' + error.response.data.msg
          : '提交失败，请检查网络连接';
      }
    } else {
      messageType.value = 'error';
      message.value = '请填写所有必填字段';
    }

    isSubmitting.value = false;
  });
};

// 重置表单处理器
const resetForm = () => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.resetFields();
  message.value = '';
};

// 加载配置处理器
const loadConfig = async () => {
  if (!configFilename.value) {
    message.value = '请输入配置名称';
    messageType.value = 'error';
    return;
  }

  isLoading.value = true;
  message.value = '';

  try {
    const response = await axios.get(`/api/config/${configFilename.value}`);
    const { code, msg } = response.data;

    if (code === 1) {
      messageType.value = 'success';
      message.value = msg || '配置加载成功';
      router.push('/');
    } else {
      messageType.value = 'error';
      message.value = msg || '加载配置失败';
    }
  } catch (error) {
    messageType.value = 'error';
    message.value = '加载失败，请检查网络';
  }

  isLoading.value = false;
};
</script>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--background-color);
  min-height: 85vh;
}

.form-wrapper {
  background-color: var(--container-bg-color);
  border-radius: 16px;
  box-shadow: 0 10px 25px var(--box-shadow-color);
  padding: 2.5rem;
  transition: all 0.3s ease;
}

.form-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.form-header h1 {
  color: var(--text-color);
  font-size: 2rem;
  margin: 0.5rem;
}

.form-header p {
  color: var(--text-color);
  font-size: 1rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem;
}

.config-form .el-form-item {
  width: 100%; /* 占满父容器 */
  box-sizing: border-box; /* 包括内边距和边框 */
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn, .reset-btn {
  width: 200px;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.submit-btn {
  background-color: #4a90e2;
  border-color: #4a90e2;
}

.reset-btn {
  color: #4a90e2;
  border-color: #4a90e2;
}

.load-config-section {
  background-color: var(--container-bg-color);
  border-radius: 16px;
  box-shadow: 0 10px 25px var(--box-shadow-color);
  padding: 2rem;
}

.load-config-input {
  display: flex;
  gap: 1rem;
}

.load-btn {
  width: 250px;
}

.message-box {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
}

.message-box.success {
  background-color: var(--container-bg-color);
  color: #67c23a;
}

.message-box.error {
  background-color: var(--container-bg-color);
  color: #f56c6c;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .config-container {
    padding: 1rem;
  }

  .form-wrapper, .load-config-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn, .reset-btn, .load-btn {
    width: 100%;
  }

  .load-config-input {
    flex-direction: column;
  }
}

/* Fade transition for message */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>