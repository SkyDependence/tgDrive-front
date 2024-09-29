<template>
  <div>
    <h2>当前配置</h2>
    
    <!-- 输入框：文件名 -->
    <div class="form-group">
      <label for="config-filename">输入配置文件名:</label>
      <input
        type="text"
        id="config-filename"
        v-model="filenameInput"
        placeholder="请输入配置文件名"
      />
      <button @click="fetchConfig(filenameInput)">查询</button>
    </div>

    <!-- 显示配置内容 -->
    <div v-if="config">
      <p><strong>token:</strong> {{ config.token }}</p>
      <p><strong>target:</strong> {{ config.target }}</p>
      <p><strong>Pass:</strong> {{ config.pass }}</p>
      <p><strong>Mode:</strong> {{ config.mode }}</p>
      <p><strong>url:</strong> {{ config.url }}</p>
    </div>
    
    <div v-else>
      <p>没有配置数据。</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ConfigDisplay',
  data() {
    return {
      filenameInput: '',  // 用户输入的文件名
      config: null        // 存储获取到的配置数据
    };
  },
  methods: {
    async fetchConfig(filename) {
      if (!filename) {
        alert('请输入文件名');
        return;
      }

      try {
        // 通过输入的文件名查询配置
        const response = await axios.get('/api/config', {
          params: { filename }
        });
        this.config = response.data;  // 将查询到的配置赋值到 config
      } catch (error) {
        console.error('获取配置失败:', error);
        this.config = null;  // 出现错误时清空配置显示
      }
    }
  }
};
</script>

<style scoped>
h2 {
  margin-top: 40px;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  padding: 8px 16px;
}
</style>
