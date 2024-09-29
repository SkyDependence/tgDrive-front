<template>
  <div id="app" class="app-container">
    <h1 class="title">配置表单</h1>

    <!-- 输入框：文件名 -->
    <div class="form-group">
      <label for="filename" class="label">JSON 文件名:</label>
      <input
        type="text"
        id="filename"
        v-model="filename"
        class="input"
        placeholder="请输入JSON文件名"
        required
      />
    </div>

    <!-- 配置表单 -->
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="token" class="label">botToken:</label>
        <input
          type="text"
          id="token"
          v-model="config.token"
          class="input"
          required
        />
      </div>

      <div class="form-group">
        <label for="target" class="label">ChannelName:</label>
        <input
          type="text"
          id="target"
          v-model="config.target"
          class="input"
          required
        />
      </div>

      <div class="form-group">
        <label for="pass" class="label">Pass:</label>
        <input
          type="password"
          id="pass"
          v-model="config.pass"
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="mode" class="label">Mode:</label>
        <input
          type="text"
          id="mode"
          v-model="config.mode"
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="url" class="label">url:</label>
        <input
          type="text"
          id="url"
          v-model="config.url"
          class="input"
        />
      </div>

      <button type="submit" class="button">提交</button>
    </form>

    <div v-if="message" class="message">
      {{ message }}
    </div>

    <ConfigDisplay :filename="filename" />
  </div>
</template>

<script>
import axios from 'axios';
import ConfigDisplay from './components/ConfigDisplay.vue';

export default {
  name: 'App',
  components: {
    ConfigDisplay
  },
  data() {
    return {
      filename: '',  // 新增：用于存储文件名
      config: {
        token: '',
        target: '',
        pass: '',
        mode: '',
        url: ''
      },
      message: ''
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const payload = {
          name: this.filename,
          ...this.config
        };
        const response = await axios.post('/api/config', payload);
        this.message = response.data;

        this.config = {
          token: '',
          target: '',
          pass: '',
          mode: '',
          url: ''
        };
      } catch (error) {
        if (error.response && error.response.data) {
          this.message = '提交失败: ' + JSON.stringify(error.response.data);
        } else {
          this.message = '提交失败，请重试。';
        }
        console.error('提交失败:', error);
      }
    }
  }
};
</script>

<style>
/* Modern Styling for the App */
.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  outline: none;
  transition: border-color 0.3s ease;
}

.input:focus {
  border-color: #007bff;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}

.message {
  color: green;
  margin-top: 1rem;
  font-weight: bold;
  text-align: center;
}

button {
  margin-top: 1rem;
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>
