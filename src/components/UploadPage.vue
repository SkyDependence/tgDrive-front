<template>
  <div id="upload-page" class="app-container">
    <h1 class="title">上传页面</h1>

    <div class="form-group">
      <label for="file" class="label">选择文件:</label>
      <input
        type="file"
        id="file"
        @change="handleFileSelect"
        class="input"
      />
    </div>

    <button @click="handleUpload" class="button" :disabled="!selectedFile">上传文件</button>

    <div v-if="message" class="message">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UploadPage',
  data() {
    return {
      selectedFile: null,
      message: ''
    };
  },
  methods: {
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },
    async handleUpload() {
      if (!this.selectedFile) {
        this.message = '请先选择一个文件。';
        return;
      }
      
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      try {
        await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.message = '文件上传成功！';
      } catch (error) {
        if (error.response && error.response.data) {
          this.message = '上传失败: ' + error.response.data;
        } else {
          this.message = '上传失败，请重试。';
        }
        console.error('上传失败:', error);
      }
    }
  }
};
</script>

<style>
/* Modern Styling for the Upload Page */
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

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.button:hover:not(:disabled) {
  background-color: #0056b3;
}

.message {
  color: green;
  margin-top: 1rem;
  font-weight: bold;
  text-align: center;
}
</style>