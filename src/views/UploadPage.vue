<template>
  <div
    id="upload-page"
    class="app-container"
    @dragover.prevent="toggleDragging(true)"
    @dragleave.prevent="toggleDragging(false)"
    @drop.prevent="handleDrop"
    @paste.prevent="handlePaste"
  >
    <h1 class="title">上传页面</h1>

    <div
      class="form-group"
      :class="{ 'dragging': isDragging }"
      @click="triggerFileInput"
    >
      <label for="file" class="label">选择文件或拖动文件到此处:</label>
      <input
        type="file"
        id="file"
        @change="handleFileSelect"
        ref="fileInput"
        class="hidden-input"
      />
      <div class="custom-file-input">
        <span>{{ selectedFileName || '未选择任何文件' }}</span>
        <button type="button">选择文件</button>
      </div>
    </div>

    <button @click="handleUpload" class="button" :disabled="!selectedFile">
      上传文件
    </button>

    <div class="message-group">
      <label for="messageInput" class="label">发送消息:</label>
      <input
        type="text"
        id="messageInput"
        v-model="inputMessage"
        placeholder="输入消息..."
        class="input"
      />
    </div>

    <button @click="handleSendMessage" class="button" :disabled="!inputMessage">
      发送消息
    </button>

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
      selectedFileName: '',
      inputMessage: '',
      message: '',
      isDragging: false,
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      this.setFile(event.target.files[0]);
    },
    handleDrop(event) {
      this.toggleDragging(false);
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.setFile(files[0]);
      }
    },
    handlePaste(event) {
      const items = event.clipboardData.items;
      for (let item of items) {
        if (item.kind === 'file') {
          this.setFile(item.getAsFile());
          break;
        }
      }
    },
    toggleDragging(isDragging) {
      this.isDragging = isDragging;
    },
    setFile(file) {
      if (file) {
        this.selectedFile = file;
        this.selectedFileName = file.name;
      }
    },
    async handleUpload() {
      if (!this.selectedFile) {
        this.message = '请先选择一个文件。';
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.message = '上传成功: ' + response.data;
      } catch (error) {
        this.message = error.response?.data || '上传失败，请重试。';
      }
    },
    async handleSendMessage() {
      if (!this.inputMessage) {
        this.message = '请先输入消息。';
        return;
      }

      try {
        await axios.post('/api/send-message', { message: this.inputMessage });
        this.message = '消息发送成功！';
        this.inputMessage = '';
      } catch (error) {
        this.message = error.response?.data || '消息发送失败，请重试。';
      }
    },
  },
};
</script>

<style scoped>
.app-container {
  max-width: 90%;
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
  padding: 1rem;
  border: 2px dashed #ccc;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
}

.message-group {
  margin-bottom: 1.5rem;
}

.dragging {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.custom-file-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
}

.custom-file-input button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.custom-file-input:hover {
  border-color: #007bff;
}

.hidden-input {
  display: none;
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
  word-wrap: break-word;
}

.input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .app-container {
    max-width: 600px;
  }

  .title {
    font-size: 2.5rem;
  }
}
</style>