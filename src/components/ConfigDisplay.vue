<!-- src/components/ConfigDisplay.vue -->
<template>
  <div>
    <h2>当前配置</h2>
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
      config: null
    };
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      try {
        const response = await axios.get('http://localhost:8080/api/config');
        this.config = response.data;
      } catch (error) {
        console.error('获取配置失败:', error);
      }
    }
  }
};
</script>

<style scoped>
/* src/components/ConfigDisplay.vue */
h2 {
  margin-top: 40px;
}

p {
  margin: 5px 0;
}
</style>
