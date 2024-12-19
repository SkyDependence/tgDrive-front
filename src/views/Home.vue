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
      <div class="load-config-wrapper">
        <div class="load-config-input">
          <el-select 
            v-model="selectedConfig" 
            placeholder="请选择配置文件" 
            class="config-select" 
            :loading="isLoadingConfigs"
            @change="handleConfigSelect"
          >
            <el-option
              v-for="config in configList"
              :key="config.name"
              :label="config.name"
              :value="config.name"
            />
          </el-select>
          <el-button 
            type="primary" 
            @click="loadConfig" 
            class="load-btn"
            :loading="isLoading"
            :disabled="!selectedConfig"
          >
            加载配置
          </el-button>
        </div>

        <!-- 配置预览部分 -->
        <div v-if="selectedConfigData" class="config-preview">
          <h3>配置预览</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="配置名称">{{ selectedConfigData.name }}</el-descriptions-item>
            <el-descriptions-item label="Bot Token">{{ selectedConfigData.token }}</el-descriptions-item>
            <el-descriptions-item label="Chat ID">{{ selectedConfigData.target }}</el-descriptions-item>
            <el-descriptions-item label="URL" v-if="selectedConfigData.url">{{ selectedConfigData.url }}</el-descriptions-item>
            <el-descriptions-item label="密码" v-if="selectedConfigData.pass">******</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import request from '../utils/request'
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

interface ConfigForm {
  name: string;
  token: string;
  target: string;
  url?: string;
  pass?: string;
}

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
const isLoadingConfigs = ref(false);
const message = ref('');
const messageType = ref('success');

// 配置文件列表
const configList = ref<ConfigForm[]>([]);
const selectedConfig = ref('');
const selectedConfigData = ref<ConfigForm | null>(null);

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

// 获取配置文件列表
const fetchConfigList = async () => {
  isLoadingConfigs.value = true;
  try {
    const response = await request.get('/config/configs');
    const { code, data } = response.data;

    if (code === 1 && Array.isArray(data)) {
      configList.value = data;
    } else {
      message.value = '获取配置列表失败';
      messageType.value = 'error';
    }
  } catch (error) {
    message.value = '获取配置列表失败，请检查网络';
    messageType.value = 'error';
  }
  isLoadingConfigs.value = false;
};

// 处理配置选择
const handleConfigSelect = (configName: string) => {
  selectedConfigData.value = configList.value.find(config => config.name === configName) || null;
};

// 提交表单处理器
const handleSubmit = async () => {
  if (!ruleFormRef.value) return;

  isSubmitting.value = true;
  message.value = '';

  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = { ...ruleForm };
        const response = await request.post('/config', payload);

        const { code, msg } = response.data;

        if (code === 1) {
          messageType.value = 'success';
          message.value = msg || '配置提交成功';
          
          // 提交成功后重置表单并刷新配置列表
          ruleFormRef.value.resetFields();
          fetchConfigList();
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
  if (!selectedConfig.value) {
    message.value = '请选择配置文件';
    messageType.value = 'error';
    return;
  }

  isLoading.value = true;
  message.value = '';

  try {
    const response = await request.get(`/config/${selectedConfig.value}`);
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

// 组件挂载时获取配置列表
onMounted(() => {
  fetchConfigList();
});
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
  width: 100%;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn,
.reset-btn {
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

.load-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.load-config-input {
  display: flex;
  gap: 1rem;
}

.config-select {
  flex: 1;
}

.load-btn {
  width: 250px;
}

.config-preview {
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 1rem;
}

.config-preview h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
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

  .form-wrapper,
  .load-config-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .reset-btn,
  .load-btn {
    width: 100%;
  }

  .load-config-input {
    flex-direction: column;
  }

  .config-select {
    width: 100%;
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