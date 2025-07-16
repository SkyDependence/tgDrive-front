<template>
  <div class="page-container">
    <!-- Form for creating/updating config -->
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>Bot 配置</span>
        </div>
      </template>
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
        class="config-form"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="ruleForm.name" placeholder="为您的配置命名" :prefix-icon="Document" size="large" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="Chat ID" prop="target">
              <el-input v-model="ruleForm.target" placeholder="请输入接收文件的频道/用户 ID" :prefix-icon="ChatDotRound" size="large" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="Bot Token" prop="token">
              <el-input v-model="ruleForm.token" placeholder="请输入 Telegram Bot Token" :prefix-icon="Key" size="large" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="自定义 URL (选填)" prop="url">
              <el-input v-model="ruleForm.url" placeholder="用于生成下载链接的域名" :prefix-icon="Link" size="large" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="访问密码 (选填)" prop="pass">
              <el-input v-model="ruleForm.pass" type="password" placeholder="为配置设置访问密码" show-password :prefix-icon="Lock" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item class="form-actions">
          <el-button type="primary" native-type="submit" :loading="isSubmitting" size="large">
            {{ isSubmitting ? '提交中...' : '保存并提交' }}
          </el-button>
          <el-button @click="resetForm" size="large">重置表单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Section for loading existing configs -->
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <el-icon><Files /></el-icon>
          <span>加载现有配置</span>
        </div>
      </template>
      <div class="load-config-wrapper">
        <el-select
          v-model="selectedConfig"
          placeholder="请选择一个配置文件进行加载"
          class="config-select"
          size="large"
          :loading="isLoadingConfigs"
          @change="handleConfigSelect"
          filterable
        >
          <el-option
            v-for="config in configList"
            :key="config.name"
            :label="config.name"
            :value="config.name"
          />
        </el-select>
        <el-button type="success" @click="loadConfig" :loading="isLoading" :disabled="!selectedConfig" size="large" plain>
          加载选中配置
        </el-button>
      </div>

      <el-collapse-transition>
        <div v-if="selectedConfigData" class="config-preview">
          <el-divider />
          <h3>配置预览</h3>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="名称">{{ selectedConfigData.name }}</el-descriptions-item>
            <el-descriptions-item label="Token">{{ selectedConfigData.token }}</el-descriptions-item>
            <el-descriptions-item label="Chat ID">{{ selectedConfigData.target }}</el-descriptions-item>
            <el-descriptions-item label="URL">{{ selectedConfigData.url || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="密码">{{ selectedConfigData.pass ? '******' : '未设置' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-collapse-transition>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import request from '../utils/request'
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Document, Key, ChatDotRound, Link, Lock, Setting, Files } from '@element-plus/icons-vue';

interface ConfigForm {
  name: string;
  token: string;
  target: string;
  url?: string;
  pass?: string;
}

const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive<ConfigForm>({
  name: '',
  token: '',
  target: '',
  url: '',
  pass: '',
});

const isSubmitting = ref(false);
const isLoading = ref(false);
const isLoadingConfigs = ref(false);
const configList = ref<ConfigForm[]>([]);
const selectedConfig = ref('');
const selectedConfigData = ref<ConfigForm | null>(null);

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  token: [{ required: true, message: '请输入 Bot Token', trigger: 'blur' }],
  target: [{ required: true, message: '请输入 Chat ID', trigger: 'blur' }],
});

const fetchConfigList = async () => {
  isLoadingConfigs.value = true;
  try {
    const response = await request.get('/config/configs');
    if (response.data.code === 1 && Array.isArray(response.data.data)) {
      configList.value = response.data.data;
    } else {
      ElMessage.error('获取配置列表失败');
    }
  } catch (error) {
    ElMessage.error('获取配置列表失败，请检查网络');
  } finally {
    isLoadingConfigs.value = false;
  }
};

const handleConfigSelect = (configName: string) => {
  selectedConfigData.value = configList.value.find(config => config.name === configName) || null;
};

const handleSubmit = async () => {
  if (!ruleFormRef.value) return;
  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      try {
        const response = await request.post('/config', ruleForm);
        if (response.data.code === 1) {
          ElMessage.success(response.data.msg || '配置提交成功');
          ruleFormRef.value?.resetFields();
          fetchConfigList();
        } else {
          ElMessage.error(response.data.msg || '提交失败');
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.msg || '提交失败，请检查网络');
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};

const resetForm = () => {
  ruleFormRef.value?.resetFields();
};

const loadConfig = async () => {
  if (!selectedConfig.value) {
    ElMessage.warning('请先选择一个配置');
    return;
  }
  isLoading.value = true;
  try {
    const response = await request.get(`/config/${selectedConfig.value}`);
    if (response.data.code === 1) {
      ElMessage.success(response.data.msg || '配置加载成功');
    } else {
      ElMessage.error(response.data.msg || '加载配置失败');
    }
  } catch (error) {
    ElMessage.error('加载失败，请检查网络');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchConfigList();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.load-config-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.config-select {
  flex-grow: 1;
}

.config-preview {
  margin-top: 20px;
}

.config-preview h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

/* Responsive styles for Home.vue */
@media (max-width: 767px) { /* Mobile breakpoint */
  .page-container {
    padding: 10px; /* Reduce padding on mobile */
    gap: 15px; /* Reduce gap between cards */
  }

  .form-actions {
    flex-direction: column; /* Stack buttons */
    gap: 10px; /* Add gap between stacked buttons */
    align-items: stretch; /* Stretch buttons to full width */
  }

  .form-actions .el-button {
    width: 100%; /* Make buttons full width */
  }

  .load-config-wrapper {
    flex-direction: column; /* Stack select and button */
    gap: 10px;
    align-items: stretch; /* Stretch items to full width */
  }

  .config-select {
    width: 100%; /* Make select full width */
  }

  .load-config-wrapper .el-button {
    width: 100%; /* Make button full width */
  }
}
</style>
