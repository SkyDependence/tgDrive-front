<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- Left Column: Upload and Progress -->
      <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><UploadFilled /></el-icon>
              <span>文件上传</span>
            </div>
          </template>

          <!-- Upload Zone -->
          <el-upload
            ref="uploadRef"
            drag
            multiple
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="selectedFiles"
            class="upload-dragger"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处, 或 <em>点击选择</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持多文件上传，支持 Ctrl+V 粘贴文件。
              </div>
            </template>
          </el-upload>

          <!-- Upload Button -->
          <div class="upload-actions">
            <el-button
              type="primary"
              @click="handleUpload"
              :disabled="isUploading || selectedFiles.length === 0"
              :loading="isUploading"
              size="large"
              :icon="Upload"
            >
              {{ isUploading ? `正在上传 (${uploadCompletedCount}/${selectedFiles.length})` : '开始上传' }}
            </el-button>
          </div>

          <!-- Progress Section -->
          <el-collapse-transition>
            <div v-if="uploadProgress.length > 0" class="progress-section">
              <div v-for="file in uploadProgress" :key="file.uid" class="file-progress-item">
                <span class="file-name">{{ file.name }}</span>
                <el-progress
                  :percentage="file.percentage"
                  :status="file.status"
                  :stroke-width="8"
                  striped
                  :striped-flow="file.status !== 'success' && file.status !== 'exception'"
                />
              </div>
            </div>
          </el-collapse-transition>
        </el-card>
      </el-col>

      <!-- Right Column: Uploaded Files -->
      <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><Tickets /></el-icon>
              <span>本次上传结果</span>
              <el-button text type="primary" @click="goToFileList">查看全部</el-button>
            </div>
          </template>
          
          <div v-if="uploadedFiles.length === 0" class="empty-state">
            <el-empty description="暂无上传成功的文件" />
          </div>

          <div v-else class="uploaded-files-list">
            <div v-for="file in uploadedFiles" :key="file.fileId" class="uploaded-file-item">
              <div class="file-details">
                <el-icon><Document /></el-icon>
                <span class="uploaded-file-name">{{ file.fileName }}</span>
              </div>
              <div class="file-actions">
                <el-tooltip content="复制 Markdown 格式" placement="top">
                  <el-button text circle :icon="Link" @click="copyMarkdown(file)" />
                </el-tooltip>
                <el-tooltip content="复制下载链接" placement="top">
                  <el-button text circle :icon="Paperclip" @click="copyLink(file)" />
                </el-tooltip>
                <el-tooltip content="打开/下载文件" placement="top">
                  <el-button text circle :icon="View" @click="openLink(file.downloadLink)" />
                </el-tooltip>
                <el-tooltip content="删除文件" placement="top">
                  <el-button text circle :icon="Delete" @click="handleDelete(file)" />
                </el-tooltip>
              </div>
            </div>
            <div class="batch-actions">
              <el-button @click="batchCopyMarkdown" :disabled="uploadedFiles.length === 0" size="small" plain>批量复制 (MD)</el-button>
              <el-button @click="batchCopyLinks" :disabled="uploadedFiles.length === 0" size="small" plain>批量复制 (链接)</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox, UploadFile, UploadFiles, UploadRawFile, UploadInstance } from 'element-plus';
import { UploadFilled, Upload, Document, Link, Tickets, Paperclip, View, Delete } from '@element-plus/icons-vue';
import { deleteFiles } from '../api/file';

interface UploadedFile {
  fileName: string;
  downloadLink: string;
  fileId: string;
}

interface ProgressItem {
  uid: number;
  name: string;
  percentage: number;
  status: 'success' | 'exception' | undefined;
}

const router = useRouter();
const uploadRef = ref<UploadInstance>();

const selectedFiles = ref<UploadFile[]>([]);
const uploadedFiles = ref<UploadedFile[]>([]);
const isUploading = ref(false);
const uploadProgress = ref<ProgressItem[]>([]);

const uploadCompletedCount = computed(() => 
  uploadProgress.value.filter(p => p.status === 'success').length
);

const handleFileChange = (file: UploadFile, fileList: UploadFiles) => {
  selectedFiles.value = fileList;
};

const handleFileRemove = (file: UploadFile, fileList: UploadFiles) => {
  selectedFiles.value = fileList;
};

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  isUploading.value = true;
  uploadedFiles.value = []; // Clear previous results
  uploadProgress.value = selectedFiles.value.map(f => ({
    uid: f.uid,
    name: f.name,
    percentage: 0,
    status: undefined,
  }));

  for (const file of selectedFiles.value) {
    const progressItem = uploadProgress.value.find(p => p.uid === file.uid);
    if (!progressItem) continue;

    const formData = new FormData();
    formData.append('file', file.raw as File);

    try {
      const response = await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            progressItem.percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        },
      });

      const { code, msg, data } = response.data;
      if (code === 1) {
        progressItem.status = 'success';
        uploadedFiles.value.push(data);
      } else {
        progressItem.status = 'exception';
        ElMessage.error(`${file.name} 上传失败: ${msg || '未知错误'}`);
      }
    } catch (error: any) {
      progressItem.status = 'exception';
      const errorMsg = error.response?.data?.msg || '网络错误';
      ElMessage.error(`${file.name} 上传失败: ${errorMsg}`);
    }
  }

  isUploading.value = false;
  selectedFiles.value = [];
  uploadRef.value?.clearFiles();
};

const goToFileList = () => {
  router.push('/fileList');
};

const copyToClipboard = (text: string, message: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(message);
  }).catch(err => {
    ElMessage.error('复制失败: ' + err);
  });
};

const copyMarkdown = (file: UploadedFile) => {
  copyToClipboard(`[${file.fileName}](${file.downloadLink})`, 'Markdown 格式已复制');
};

const copyLink = (file: UploadedFile) => {
  copyToClipboard(file.downloadLink, '下载链接已复制');
};

const openLink = (url: string) => {
  window.open(url, '_blank');
};

const batchCopyMarkdown = () => {
  const text = uploadedFiles.value.map(f => `[${f.fileName}](${f.downloadLink})`).join('\n');
  copyToClipboard(text, `已批量复制 ${uploadedFiles.value.length} 个 Markdown 链接`);
};

const batchCopyLinks = () => {
  const text = uploadedFiles.value.map(f => f.downloadLink).join('\n');
  copyToClipboard(text, `已批量复制 ${uploadedFiles.value.length} 个下载链接`);
};

const handleDelete = async (file: UploadedFile) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.fileName}" 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const response = await deleteFiles([file.fileId]);
    if (response.data?.code === 1) {
      ElMessage.success('文件删除成功');
      // Remove file from the list
      uploadedFiles.value = uploadedFiles.value.filter(f => f.fileId !== file.fileId);
    } else {
      ElMessage.error(response.data?.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作失败');
    }
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === 'file') {
      const file = items[i].getAsFile();
      if (file) {
        const uid = Date.now() + i;
        const uploadFile: UploadFile = {
          name: file.name,
          size: file.size,
          uid: uid,
          raw: Object.assign(file, { uid }) as UploadRawFile,
          status: 'ready',
        };
        
        const isDuplicate = selectedFiles.value.some(f => f.name === uploadFile.name && f.size === uploadFile.size);
        if (!isDuplicate) {
          selectedFiles.value.push(uploadFile);
        }
      }
    }
  }
  if (selectedFiles.value.length > 0) {
    ElMessage.success('已通过粘贴添加文件');
  }
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
}

.content-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
}

.upload-dragger {
  margin-bottom: 20px;
}

.upload-actions {
  text-align: center;
}

.progress-section {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.file-progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.file-name {
  flex-shrink: 1; /* Allow shrinking */
  max-width: 120px; /* Set max-width instead of fixed width */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-progress {
  flex-grow: 1;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
}

.uploaded-files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.uploaded-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--hover-bg-color);
}

.file-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.uploaded-file-name {
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 5px;
}

.batch-actions {
  margin-top: 15px;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
}

:deep(.el-progress-bar__inner--striped) {
  animation-duration: 2s; /* 减慢流动动画速度，默认为1s */
}

/* Responsive styles for UploadPage.vue */
@media (max-width: 767px) { /* Mobile breakpoint */
  .page-container {
    padding: 10px; /* Reduce padding on mobile */
  }

  .card-header {
    flex-wrap: wrap; /* Allow header items to wrap */
    justify-content: center; /* Center header items */
    text-align: center;
  }

  .card-header .el-button {
    margin-top: 5px; /* Add some space if button wraps */
  }

  .upload-actions .el-button {
    width: 100%; /* Make upload button full width */
  }

  .file-progress-item {
    flex-direction: column; /* Stack file name and progress bar */
    align-items: flex-start; /* Align items to start */
  }

  .file-name {
    width: 100%; /* Take full width */
    max-width: none; /* Remove max-width constraint */
    text-align: left;
  }

  .el-progress {
    width: 100%; /* Make progress bar full width */
  }

  .uploaded-file-item {
    flex-direction: column; /* Stack file details and buttons */
    align-items: flex-start;
    gap: 5px;
  }

  .uploaded-file-item .el-button-group {
    width: 100%; /* Make button group full width */
    justify-content: flex-start; /* Align buttons to start */
  }
}
</style>