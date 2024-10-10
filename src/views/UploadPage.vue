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
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-top: 20px;
  border: 2px dashed #ccc;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
}

.form-group.dragging {
  border-color: #66ccff;
  background-color: #f3f9ff;
}

.label {
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
  color: #666;
}

.hidden-input {
  visibility: hidden;
  position: absolute;
}

.custom-file-input {
  cursor: pointer;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
}

.custom-file-input span {
  margin-right: 10px;
}

.custom-file-input button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #5cb85c;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  margin-top: 20px;
  cursor: pointer;
}

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message-group {
  margin-top: 20px;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.message {
  margin-top: 20px;
  background-color: #f0f8ff;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #b6dfff;
}
</style>
