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
        multiple  
        @change="handleFileSelect"
        ref="fileInput"
        class="hidden-input"
      />
      <div class="custom-file-input">
        <button type="button">选择文件</button>
      </div>
    </div>

    <!-- 候选框显示文件列表 -->
    <div class="file-list" v-if="selectedFiles.length > 0">
      <h3>待上传文件：</h3>
      <ul>
        <li v-for="(file, index) in selectedFiles" :key="index">
          <span>{{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)</span>
          <button @click="removeFile(index)">删除</button>
        </li>
      </ul>
      <button @click="clearAllFiles" class="button">清空全部文件</button>
    </div>

    <!-- 上传按钮，上传时禁用并显示“正在上传” -->
    <button 
      @click="handleUpload" 
      class="button" 
      :disabled="isUploading || !selectedFiles.length"
    >
      {{ isUploading ? '正在上传' : '上传文件' }}
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

    <div v-if="uploadedFiles.length > 0" class="message">
      <h3>上传成功的文件：</h3>
      <ul>
        <li v-for="(file, index) in uploadedFiles" :key="index">
          <span>{{ file.fileName }}: </span>
          <a :href="file.downloadLink" target="_blank">{{ file.downloadLink }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UploadPage',
  data() {
    return {
      selectedFiles: [],  // 用来存储多个选中的文件
      uploadedFiles: [],  // 存储上传成功后返回的文件数据
      inputMessage: '',
      message: '',
      isDragging: false,
      isUploading: false  // 标志是否正在上传
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      this.addFiles(event.target.files); // 处理多个文件并添加到列表中
    },
    handleDrop(event) {
      this.toggleDragging(false);
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.addFiles(files);
      }
    },
    handlePaste(event) {
      const items = event.clipboardData.items;
      for (let item of items) {
        if (item.kind === 'file') {
          this.addFiles([item.getAsFile()]);
          break;
        }
      }
    },
    toggleDragging(isDragging) {
      this.isDragging = isDragging;
    },
    addFiles(files) {
      if (files.length > 0) {
        // 添加新文件到现有文件数组中，而不是替换
        this.selectedFiles = [...this.selectedFiles, ...Array.from(files)];
      }
    },
    removeFile(index) {
      // 移除单个文件
      this.selectedFiles.splice(index, 1);
    },
    clearAllFiles() {
      // 清空所有文件
      this.selectedFiles = [];
    },
    async handleUpload() {
      if (this.selectedFiles.length === 0) {
        this.message = '请先选择至少一个文件。';
        return;
      }

      const formData = new FormData();
      this.selectedFiles.forEach(file => {
        formData.append('file', file); // 将每个文件添加到formData中
      });

      try {
        // 设置上传中状态，禁用按钮
        this.isUploading = true;

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        this.uploadedFiles = response.data; // 更新上传的文件列表
        this.selectedFiles = []; // 上传成功后清空文件列表
      } catch (error) {
        this.message = error.response?.data || '上传失败，请重试。';
      } finally {
        // 上传完成或失败后，重置上传状态
        this.isUploading = false;
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

.file-list {
  margin-top: 20px;
}

.file-list ul {
  list-style: none;
  padding: 0;
}

.file-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
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
  word-break: break-word; /* 让长单词或链接在需要时自动换行 */
  overflow-wrap: break-word; /* 兼容处理长单词自动换行 */
}

.message ul {
  list-style: none;
  padding: 0;
}

.message li {
  padding: 5px 0;
}
</style>
