<template>
  <div class="file-list-container">
    <div class="header">
      <h2 class="title">文件列表</h2>
      <el-button type="warning" :size="'small'" @click="openUpdateDialog" class="update-btn">
        更新URL
      </el-button>
    </div>

    <el-table :data="fileList" v-loading="loading" class="custom-table" :stripe="true" :height="450">
      <el-table-column prop="fileName" label="文件名" :width="200" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="操作" :width="350" :show-overflow-tooltip="true">
        <template #default="scope">
          <!-- 复制Markdown按钮 -->
          <el-button type="primary" size="small" @click="copyMarkdown(scope.row)">
            复制Markdown
          </el-button>

          <!-- 复制下载链接按钮 -->
          <el-button type="success" size="small" @click="copyLink(scope.row)">
            复制链接
          </el-button>

          <!-- 直接跳转下载按钮 -->
          <el-button type="warning" size="small" @click="openLink(scope.row.downloadUrl)">
            直接下载
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" :width="100">
        <template #default="scope">
          <span class="size-tag">{{ scope.row.size }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fileId" label="文件 ID" :width="150" :show-overflow-tooltip="true" />
      <el-table-column label="上传时间" :width="180">
        <template #default="scope">
          <span class="time-text">{{ formatUploadTime(scope.row.uploadTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-if="totalItems > 0" v-model:current-page="currentPage" v-model:page-size="pageSize"
      :total="totalItems" :layout="'total, sizes, prev, pager, next, jumper'" @size-change="handleSizeChange"
      @current-change="handlePageChange" class="custom-pagination" />

    <el-dialog v-model="isDialogVisible" title="警告" :width="'30%'" :center="true" class="custom-dialog">
      <div class="dialog-content">
        <p>更新URL是更新数据库中的网址前缀，也就是更换了域名后，直接访问文件列表中的URL，请求不能到达服务器的情况。</p>
        <p class="dialog-question">是否更新URL？</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdate">确认更新</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../utils/request';
import { ElMessage } from 'element-plus';
import type { Component } from 'vue';

interface FileItem {
  fileName: string;
  downloadUrl: string;
  size: string;
  fileId: string;
  uploadTime: number;
}

const fileList = ref<FileItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const isDialogVisible = ref(false);

const fetchFileList = async () => {
  loading.value = true;
  try {
    const response = await request.get(`/fileList?page=${currentPage.value}&size=${pageSize.value}`);
    if (response.data && response.data.code === 1) {
      const pageResult = response.data.data;
      fileList.value = pageResult.records || [];
      totalItems.value = pageResult.total || 0;
    } else {
      console.error('获取文件列表失败:', response.data.msg || '未知错误');
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const formatUploadTime = (uploadTime: number) => {
  return new Date(uploadTime * 1000).toLocaleString();
};

const openUpdateDialog = () => {
  isDialogVisible.value = true;
};

const confirmUpdate = async () => {
  try {
    const response = await request.put('/file-url');
    if (response.data && response.data.code === 1) {
      ElMessage({
        message: 'URL更新成功',
        type: 'success',
      });
      fetchFileList();
    } else {
      ElMessage({
        message: 'URL更新失败:' + (response.data.msg || '未知错误'),
        type: 'error'
      });
    }
  } catch (error) {
    console.error('更新URL失败:', error);
  } finally {
    isDialogVisible.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchFileList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchFileList();
};

const copyMarkdown = (row: FileItem) => {
  const markdownText = `[${row.fileName}](${row.downloadUrl})`;
  copyToClipboard(markdownText);
  ElMessage.success('Markdown 格式已复制到剪贴板');
};

const copyLink = (row: FileItem) => {
  const link = row.downloadUrl;
  copyToClipboard(link);
  ElMessage.success('下载链接已复制到剪贴板');
};

const openLink = (url: string) => {
  window.open(url, '_blank');
};

const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

onMounted(() => {
  fetchFileList();
});
</script>


<style scoped>
.file-list-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--container-bg-color);
  border-radius: 12px;
  box-shadow: 0 6px 16px var(--box-shadow-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 2rem;
  color: var(--text-color);
  font-weight: 600;
  margin: 0;
}

.update-btn {
  transition: transform 0.2s ease;
}

.update-btn:hover {
  transform: scale(1.05);
}

.custom-table {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.download-link {
  text-decoration: none;
  font-weight: 500;
}

.size-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.time-text {
  color: var(--text-color);
}

.custom-pagination {
  margin-top: 2rem;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.dialog-content {
  text-align: center;
  padding: 1rem;
}

.dialog-question {
  margin-top: 1rem;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

@media screen and (max-width: 768px) {
  .file-list-container {
    margin: 1rem;
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>