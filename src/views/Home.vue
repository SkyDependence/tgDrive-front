<template>
  <div id="app" class="app-container">

    <h1 class="title">配置表单</h1>

    <!-- 配置表单 -->
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="配置文件名" prop="name">
        <el-input
          v-model="ruleForm.name"
          placeholder="请输入配置文件名"
          required
          class="styled-input"
        />
      </el-form-item>

      <el-form-item label="botToken" prop="token">
        <el-input
          v-model="ruleForm.token"
          placeholder="请输入telegram botToken"
          required
          class="styled-input"
        />
      </el-form-item>

      <el-form-item label="chatID" prop="target">
        <el-input
          v-model="ruleForm.target"
          placeholder="请输入bot和你的对话的id"
          required
          class="styled-input"
        />
      </el-form-item>

      <el-form-item label="url (选填)" prop="url">
        <el-input
          v-model="ruleForm.url"
          placeholder="请输入网站的url"
          class="styled-input"
        />
      </el-form-item>

      <el-form-item label="Pass (选填)" prop="pass">
        <el-input
          v-model="ruleForm.pass"
          type="password"
          placeholder="请输入下载文件时需要的密码"
          class="styled-input"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" class="submit-button">提交</el-button>
        <el-button @click="resetForm" class="reset-button">重置</el-button>
      </el-form-item>
    </el-form>

    <div v-if="message" class="message">
      {{ message }}
    </div>

    <!-- 加载配置文件 -->
    <div class="config-section">
      <h2 class="title">加载配置文件</h2>
      <el-input
        v-model="configFilename"
        placeholder="请输入配置文件名"
        required="true"
        class="styled-input"
      />
      <div class="button-container">
        <el-button type="primary" @click="loadConfig" class="submit-button">加载配置</el-button>
      </div>
    </div>

    <!--
    <div class="config-section">
      <h2 class="title">查询配置文件</h2>
      <el-form @submit.prevent class="query-form">
        <el-input
          v-model="filenameInput"
          placeholder="请输入配置文件名"
          aria-required="true"
          class="styled-input"
        />
        <div class="button-container">
          <el-button type="primary" @click="fetchConfig(filenameInput)" class="submit-button">查询</el-button>
        </div>
      </el-form>

      <div v-if="configData && configData.length">
        <el-table :data="configData" style="width: 100%">
          <el-table-column prop="key" label="配置项" />
          <el-table-column prop="value" label="值" />
        </el-table>
      </div>
      <div v-else>
        <p>没有配置数据。</p>
      </div>
    </div>
    -->
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';

const ruleFormRef = ref<FormInstance>();
const router = useRouter();

const ruleForm = reactive({
  name: '',
  token: '',
  target: '',
  url: '',
  pass: '',
});

const filenameInput = ref('');
const configFilename = ref('');
const configData = ref(null);
const message = ref('');

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入配置文件名', trigger: 'blur' }],
  token: [{ required: true, message: '请输入telegram botToken', trigger: 'blur' }],
  target: [{ required: true, message: '请输入chatID', trigger: 'blur' }],
  url: [{ required: false, message: '请输入网站的url', trigger: 'blur' }],
  pass: [{ required: false, message: '请输入下载文件时需要的密码', trigger: 'blur' }],
});

const handleSubmit = async () => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = { ...ruleForm };
        const response = await axios.post('/api/config', payload);
        message.value = response.data;
        Object.assign(ruleForm, {
          name: '',
          token: '',
          target: '',
          url: '',
          pass: '',
        });
      } catch (error) {
        message.value = error.response?.data ? '提交失败: ' + JSON.stringify(error.response.data) : '提交失败，请重试。';
      }
    } else {
      console.log('表单验证失败');
    }
  });
};

const resetForm = () => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.resetFields();
};

const loadConfig = async () => {
  try {
    const response = await axios.get(`/api/config/${configFilename.value}`);
    message.value = response.data;
    router.push('/upload');
  } catch (error) {
    message.value = error.response?.data ? '加载配置失败: ' + JSON.stringify(error.response.data) : '加载配置失败，请重试。';
  }
};

/*
const fetchConfig = async (name: string) => {
  if (!name) {
    alert('请输入文件名');
    return;
  }
  try {
    const response = await axios.get('/api/config', { params: { name } });
    const data = response.data;
    configData.value = [
      { key: 'token', value: data.token },
      { key: 'chatID', value: data.target },
      { key: 'Pass', value: data.pass },
      { key: 'url', value: data.url }
    ];
  } catch (error) {
    console.error('获取配置失败:', error);
    configData.value = null;
  }
};
*/

</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}


.title {
  font-size: 1.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: bold;
}

.config-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.styled-input {
  width: 100%;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.submit-button, .styled-button {
  width: 200px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-button {
  width: 200px;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover, .styled-button:hover {
  background-color: #66b1ff;
}

.reset-button:hover {
  background-color: #c0c0c0;
}

.message {
  color: #67c23a;
  margin-top: 1rem;
  font-weight: bold;
  text-align: center;
}
</style>
