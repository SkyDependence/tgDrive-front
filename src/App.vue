<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>配置表单</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="botToken">botToken:</label>
        <input
          type="text"
          id="token"
          v-model="config.token"
          required
        />
      </div>

      <div class="form-group">
        <label for="target">ChannelName:</label>
        <input
          type="text"
          id="target"
          v-model="config.target"
          required
        />
      </div>

      <div class="form-group">
        <label for="pass">Pass:</label>
        <input
          type="password"
          id="pass"
          v-model="config.pass"
        />
      </div>

      <div class="form-group">
        <label for="mode">Mode:</label>
        <input
          type="text"
          id="mode"
          v-model="config.mode"
        />
      </div>

      <div class="form-group">
        <label for="url">url:</label>
        <input
          type="text"
          id="url"
          v-model="config.url"
        />
      </div>

      <button type="submit">提交</button>
    </form>

    <div v-if="message" class="message">
      {{ message }}
    </div>

    <ConfigDisplay />
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
        const response = await axios.post('/api/config', this.config);
        this.message = response.data;
        // 清空表单
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
/* src/App.vue */
#app {
  font-family: Arial, sans-serif;
  margin: 50px;
}

h1 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
}

.message {
  color: green;
  margin-top: 20px;
}
</style>
