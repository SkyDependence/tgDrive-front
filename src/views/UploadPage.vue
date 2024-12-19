<template>
  <div class="upload-page-container">
    <el-card shadow="hover" class="upload-card">
      <template #header>
        <div class="card-header">
          <h1>文件上传</h1>
          <el-button type="primary" @click="goToFileList">文件列表</el-button>
        </div>
      </template>

      <!-- File Upload Zone -->
      <el-upload
        class="file-uploader"
        drag
        multiple
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="selectedFiles"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击选择文件</em>，
          也可以Ctrl + v将文件粘贴上传
        </div>
      </el-upload>

      <!-- File List 
      <el-card v-if="selectedFiles.length > 0" shadow="never" class="file-list-card">
        <template #header>
          <div class="file-list-header">
            <span>待上传文件</span>
            <el-button type="text" @click="clearAllFiles" icon="Delete">清空</el-button>
          </div>
        </template>
        <el-scrollbar max-height="200px">
          <el-table :data="selectedFiles" size="small">
            <el-table-column prop="name" label="文件名" />
            <el-table-column label="大小">
              <template #default="scope">
                {{ (scope.row.size / 1024).toFixed(2) }} KB
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  @click="removeFile(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
      </el-card>\
    -->

      <!-- Upload Button -->
      <div class="upload-actions">
        <el-button 
          type="primary" 
          @click="handleUpload" 
          :disabled="isUploading || selectedFiles.length === 0"
          :loading="isUploading"
        >
          {{ isUploading ? '正在上传' : '上传文件' }}
        </el-button>
      </div>

      <!-- Message Section -->
      <el-card shadow="never" class="message-section">
        <el-form :model="messageForm" @submit.prevent="handleSendMessage">
          <el-form-item label="发送消息">
            <el-input 
              v-model="messageForm.message" 
              placeholder="输入消息以测试Bot连接..."
              clearable
            >
              <template #append>
                <el-button 
                  type="primary" 
                  @click="handleSendMessage"
                  :disabled="!messageForm.message"
                >
                  发送
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Uploaded Files and Messages -->
      <el-alert 
        v-if="message" 
        :title="message" 
        type="info" 
        show-icon 
        class="upload-message"
      />

      <el-card v-if="uploadedFiles.length > 0" shadow="never" class="uploaded-files-card">
        <template #header>
          <span>已上传文件</span>
        </template>
        <el-table :data="uploadedFiles" size="small">
          <el-table-column prop="fileName" label="文件名" />
          <el-table-column label="操作">
            <template #default="scope">
              <!-- 复制 Markdown 按钮 -->
              <el-button 
                type="primary" 
                size="small" 
                @click="copyMarkdown(scope.row)"
              >
                复制Markdown
              </el-button>

              <!-- 复制链接按钮 -->
              <el-button 
                type="success" 
                size="small" 
                @click="copyLink(scope.row)"
              >
                复制链接
              </el-button>

              <!-- 直接跳转下载按钮 -->
              <el-button 
                type="warning" 
                size="small" 
                @click="openLink(scope.row.downloadLink)"
              >
                直接下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { 
  ElMessage, 
  UploadFile, 
  UploadFiles, 
  UploadRawFile
} from 'element-plus';
import { 
  UploadFilled, 
  Document, 
  Delete 
} from '@element-plus/icons-vue';
import { onBeforeUnmount } from 'vue';
import { onMounted } from 'vue';

const router = useRouter();

// Reactive state
const selectedFiles = ref<UploadFile[]>([]);
const uploadedFiles = ref<any[]>([]);
const message = ref('');
const isUploading = ref(false);

const messageForm = reactive({
  message: ''
});

// File handling methods
const handleFileChange = (file: UploadFile, fileList: UploadFiles) => {
  selectedFiles.value = fileList;
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const clearAllFiles = () => {
  selectedFiles.value = [];
};

// Upload method
const handleUpload = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择至少一个文件');
    return;
  }

  isUploading.value = true;

  try {
    // 逐个异步上传文件
    await Promise.all(selectedFiles.value.map(async (uploadFile) => {
      const formData = new FormData();
      formData.append('file', uploadFile.raw as File);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { code, msg, data } = response.data;

        if (code === 1) {
          uploadedFiles.value.push(data);
          ElMessage.success(msg || '文件上传成功');
        } else {
          ElMessage.error(msg || '文件上传失败，请重试');
        }
      } catch (error: any) {
        ElMessage.error(
          error.response?.data?.msg 
            ? '上传失败: ' + error.response.data.msg
            : '上传失败，请检查网络连接或稍后重试'
        );
      }
    }));
    
    // 清空已选文件
    selectedFiles.value = [];
  } catch (error) {
    ElMessage.error('上传过程中发生错误');
  } finally {
    isUploading.value = false;
  }
};

// Send message method
const handleSendMessage = async () => {
  if (!messageForm.message) {
    ElMessage.warning('请先输入消息');
    return;
  }

  try {
    await axios.post('/api/send-message', { message: messageForm.message });
    ElMessage.success('消息发送成功');
    messageForm.message = '';
  } catch (error: any) {
    ElMessage.error(error.response?.data || '消息发送失败，请重试');
  }
};

// Navigation method
const goToFileList = () => {
  router.push('/fileList');
};

const handlePaste = (event: ClipboardEvent) => {
  // 只获取粘贴的第一个对象
  const item = event.clipboardData?.items[0];
  if (!item) return; // 没有内容时直接返回

  // 检查第一个对象是否为文件
  if (item.kind === 'file') {
    const file = item.getAsFile();
    if (file) {
      
      // 转换为 Element Plus 所需的 UploadFile 格式
      const rawFile: UploadRawFile = Object.assign(file, { 
        uid: Date.now() 
      });
      const uploadFile: UploadFile = {
        name: rawFile.name,
        size: rawFile.size,
        uid: rawFile.uid,
        raw: rawFile,
        status: 'ready'
      };

      // 文件去重逻辑
      const isDuplicate = selectedFiles.value.some(
        existingFile => existingFile.name === uploadFile.name && existingFile.size === uploadFile.size
      );

      if (!isDuplicate) {
        selectedFiles.value.push(uploadFile);
        ElMessage.success(`已添加粘贴的文件: ${file.name}`);
      } else {
        ElMessage.warning(`文件 ${file.name} 已经存在列表中`);
      }
    }
  } else {
    console.log('粘贴的第一个对象不是文件，类型为:', item.kind, item.type);
  }
};

// 复制 Markdown 按钮的逻辑
const copyMarkdown = (row: any) => {
  const markdownText = `![${row.fileName}](${row.downloadLink})`;
  copyToClipboard(markdownText);
  ElMessage.success('Markdown 格式已复制到剪贴板');
};

// 复制链接按钮的逻辑
const copyLink = (row: any) => {
  const link = row.downloadLink;
  copyToClipboard(link);
  ElMessage.success('下载链接已复制到剪贴板');
};

// 直接下载按钮的逻辑
const openLink = (url: string) => {
  window.open(url, '_blank');
};

// 复制到剪贴板的通用方法
const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

// 组件加载时监听粘贴事件，卸载时移除
onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<style scoped>
.upload-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}



.file-uploader {
  margin-bottom: 20px;
}

.file-list-card,
.uploaded-files-card {
  margin: 20px 0;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-actions {
  text-align: center;
  margin: 20px 0;
}

.message-section {
  margin-top: 20px;
}

.upload-message {
  margin: 20px 0;
}
</style>