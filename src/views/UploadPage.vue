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

      <!-- Upload Progress Section - 在所有上传完成后自动隐藏 -->
      <div v-if="uploading && uploadProgress.length > 0" class="upload-progress-container">
        <div class="upload-status-message">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              文件已上传到服务器，正在等待服务器处理...
            </template>
            <template #default>
              <p>注意：文件上传分两个阶段，当进度条达到100%时，还需等待服务器将文件转发到最终存储位置。</p>
            </template>
          </el-alert>
        </div>
        <div v-for="(file, index) in uploadProgress" :key="index" class="file-progress-item">
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="progress-percentage">{{ file.percentage.toFixed(0) }}%</span>
          </div>
          <el-progress 
            :percentage="file.percentage" 
            :status="file.status === 'success' ? 'success' : file.status === 'error' ? 'exception' : ''"
          />
        </div>
      </div>

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
const uploading = ref(false);

// 上传进度状态
interface ProgressItem {
  name: string;
  percentage: number;
  status: 'progress' | 'success' | 'error';
}

const uploadProgress = ref<ProgressItem[]>([]);

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
  uploading.value = true;
  
  // 初始化进度状态
  uploadProgress.value = selectedFiles.value.map(file => ({
    name: file.name,
    percentage: 0,
    status: 'progress' as const
  }));

  try {
    // 逐个异步上传文件
    await Promise.all(selectedFiles.value.map(async (uploadFile, index) => {
      const formData = new FormData();
      formData.append('file', uploadFile.raw as File);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // 添加上传进度事件处理
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = (progressEvent.loaded / progressEvent.total) * 100;
              uploadProgress.value[index].percentage = percentage;
              
              // 当进度达到100%时，将状态设为success
              if (percentage >= 100) {
                uploadProgress.value[index].status = 'success';
              }
            }
          }
        });

        const { code, msg, data } = response.data;

        if (code === 1) {
          uploadedFiles.value.push(data);
          ElMessage.success(msg || '文件上传成功');
          uploadProgress.value[index].status = 'success';
        } else {
          ElMessage.error(msg || '文件上传失败，请重试');
          uploadProgress.value[index].status = 'error';
        }
      } catch (error: any) {
        uploadProgress.value[index].status = 'error';
        ElMessage.error(
          error.response?.data?.msg 
            ? '上传失败: ' + error.response.data.msg
            : '上传失败，请检查网络连接或稍后重试'
        );
      }
    }));
    
    // 清空已选文件
    selectedFiles.value = [];
    
    // 所有文件上传完成后，设置一个延时清空进度条
    setTimeout(() => {
      uploading.value = false;
      uploadProgress.value = [];
    }, 3000); // 3秒后隐藏进度条，给用户时间看到成功状态
    
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

/* 上传进度相关样式 - 使用CSS变量适配暗色主题 */
.upload-progress-container {
  margin: 20px 0;
  border: 1px solid;
  border-color: var(--el-border-color-light, #EBEEF5);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--container-bg-color, rgba(255, 255, 255, 0.95));
  color: var(--text-color, #1e293b);
  box-shadow: 0 2px 12px 0 var(--box-shadow-color, rgba(0, 0, 0, 0.08));
}

.upload-status-message {
  margin-bottom: 15px;
}

.file-progress-item {
  margin-bottom: 10px;
}

.file-progress-item:last-child {
  margin-bottom: 0;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.file-name {
  font-size: 14px;
  color: var(--text-color, #606266);
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-percentage {
  font-size: 14px;
  color: var(--active-menu-color, #409eff);
  font-weight: bold;
}

/* 暗色主题下特定的样式 */
html.dark .upload-progress-container {
  background-color: var(--container-bg-color, rgba(47, 47, 47, 0.95));
  border-color: rgba(84, 84, 84, 0.5);
}

html.dark .file-name {
  color: var(--text-color, #e2e8f0);
}

html.dark .progress-percentage {
  color: var(--active-menu-color, #60a5fa);
}
</style>