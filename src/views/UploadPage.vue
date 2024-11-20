<template>
  <div id="upload-page" class="app-container" @dragover.prevent="toggleDragging(true)"
    @dragleave.prevent="toggleDragging(false)" @drop.prevent="handleDrop" @paste.prevent="handlePaste">
    <h1 class="title">上传页面</h1>

    <!-- 跳转按钮 -->
    <div class="top-right-button">
      <el-button type="primary" @click="goToFileList">文件列表</el-button>
    </div>

    <div class="form-group" :class="{ 'dragging': isDragging }" @click="triggerFileInput">
      <label for="file" class="label">选择文件或拖动文件到此处:</label>
      <input type="file" id="file" multiple @change="handleFileSelect" ref="fileInput" class="hidden-input" />
      <div class="custom-file-input">
        <!-- 阻止事件冒泡 -->
        <button type="button" @click.stop="triggerFileInput">选择文件</button>
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
    <button @click="handleUpload" class="button" :disabled="isUploading || !selectedFiles.length">
      {{ isUploading ? '正在上传' : '上传文件' }}
    </button>

    <div class="message-group">
      <label for="messageInput" class="label">发送消息:</label>
      <input type="text" id="messageInput" v-model="inputMessage" placeholder="输入消息..." class="input" />
    </div>

    <button @click="handleSendMessage" class="button" :disabled="!inputMessage">
      发送消息
    </button>

    <div v-if="uploadedFiles.length > 0" class="message">
      <h3> 消息：</h3>
      <ul>
        <li v-for="(file, index) in uploadedFiles" :key="index">
          <span>{{ file.fileName }}: </span>
          <a :href="file.downloadLink" target="_blank">{{ file.downloadLink }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const fileInput = ref(null); // 文件输入引用
const selectedFiles = ref([]);
const uploadedFiles = ref([]);
const inputMessage = ref('');
const message = ref('');
const isDragging = ref(false);
const isUploading = ref(false);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click(); // 触发文件选择
};

const handleFileSelect = (event) => {
  addFiles(event.target.files);
};

const handleDrop = (event) => {
  toggleDragging(false);
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    addFiles(files);
  }
};

const handlePaste = (event) => {
  const items = event.clipboardData.items;
  for (let item of items) {
    if (item.kind === 'file') {
      addFiles([item.getAsFile()]);
      break;
    }
  }
};

const toggleDragging = (state) => {
  isDragging.value = state;
};

const addFiles = (files) => {
  if (files.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(files)];
  }
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const clearAllFiles = () => {
  selectedFiles.value = [];
};

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) {
    message.value = '请先选择至少一个文件。';
    return;
  }

  // 创建 FormData 对象并添加文件
  const formData = new FormData();
  selectedFiles.value.forEach((file) => {
    formData.append('file', file);
  });

  try {
    isUploading.value = true;

    // 发送 POST 请求上传文件
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 解构后端返回的 Result 数据
    const { code, msg, data } = response.data;

    if (code === 1) {
      // 上传成功，解析并显示文件信息
      const uploadedFilesData = JSON.parse(data); // 后端返回的是 JSON 字符串
      uploadedFiles.value = uploadedFilesData;
      message.value = msg || '文件上传成功';
      selectedFiles.value = [];
    } else {
      // 上传失败，显示后端返回的错误消息
      message.value = msg || '文件上传失败，请重试。';
    }
  } catch (error) {
    // 捕获请求异常，显示错误提示
    message.value = error.response?.data?.msg
      ? '上传失败: ' + error.response.data.msg
      : '上传失败，请检查网络连接或稍后重试。';
  } finally {
    isUploading.value = false; // 无论成功或失败，均取消上传状态
  }
};

const handleSendMessage = async () => {
  if (!inputMessage.value) {
    message.value = '请先输入消息。';
    return;
  }

  try {
    await axios.post('/api/send-message', { message: inputMessage.value });
    message.value = '消息发送成功！';
    inputMessage.value = '';
  } catch (error) {
    message.value = error.response?.data || '消息发送失败，请重试。';
  }
};

// 跳转到文件列表页面
const goToFileList = () => {
  router.push('/fileList');
};
</script>

<style scoped>
.app-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  word-break: break-word;
  /* 让长单词或链接在需要时自动换行 */
  overflow-wrap: break-word;
  /* 兼容处理长单词自动换行 */
}

.message ul {
  list-style: none;
  padding: 0;
}

.message li {
  padding: 5px 0;
}
</style>
