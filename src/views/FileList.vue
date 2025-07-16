<template>
  <div class="page-container">
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><FolderOpened /></el-icon>
            <span>文件列表</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="openUpdateDialog" :icon="Refresh">更新 URL 前缀</el-button>
          </div>
        </div>
      </template>

      <!-- Desktop Table View -->
      <el-table
        v-if="!isMobile"
        :data="fileList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        height="calc(100vh - 280px)"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip fixed="left">
          <template #default="scope">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-icon><Document /></el-icon>
              <span>{{ scope.row.fileName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" align="center" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" align="center">
          <template #default="scope">
            {{ formatUploadTime(scope.row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="copyMarkdown(scope.row)" :icon="Memo">Markdown</el-button>
              <el-button type="success" size="small" @click="copyLink(scope.row)" :icon="Link">链接</el-button>
              <el-button type="warning" size="small" @click="openLink(scope.row.downloadUrl)" :icon="Download">下载</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile List View -->
      <div v-if="isMobile" class="mobile-file-list" ref="mobileListRef">
        <el-empty v-if="fileList.length === 0 && !loading" description="暂无文件" />
        <el-skeleton v-if="loading" :rows="5" animated />
        <div v-else>
          <div 
            v-for="file in fileList" 
            :key="file.fileId" 
            class="mobile-file-item"
            :class="{ 'is-selected': isSelected(file) }"
            @click="toggleSelection(file)"
          >
            <div class="file-info">
              <el-checkbox 
                :model-value="isSelected(file)" 
                @change="() => toggleSelection(file)" 
                @click.stop
                size="large"
                class="mobile-checkbox"
              />
              <el-icon class="file-icon"><Document /></el-icon>
              <span class="file-name-mobile">{{ file.fileName }}</span>
            </div>
            <div class="file-meta">
              <span>大小: {{ file.size }}</span>
              <span>上传时间: {{ formatUploadTime(file.uploadTime) }}</span>
            </div>
            <div class="file-actions">
              <el-button-group>
                <el-button type="primary" size="small" @click.stop="copyMarkdown(file)" :icon="Memo" circle />
                <el-button type="success" size="small" @click.stop="copyLink(file)" :icon="Link" circle />
                <el-button type="warning" size="small" @click.stop="openLink(file.downloadUrl)" :icon="Download" circle />
              </el-button-group>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-toolbar" :class="{ 'is-mobile': isMobile }">
        <div class="batch-actions">
          <el-button 
            type="primary" 
            @click="batchCopyMarkdown" 
            :disabled="selectedFiles.length === 0"
            :icon="Memo"
            plain
          >
            批量复制 (MD)
          </el-button>
          <el-button 
            type="success" 
            @click="batchCopyLinks" 
            :disabled="selectedFiles.length === 0"
            :icon="Link"
            plain
          >
            批量复制 (链接)
          </el-button>
        </div>
        <el-pagination
          v-if="totalItems > 0"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalItems"
          :page-sizes="[10, 20, 50, 100]"
          :layout="isMobile ? 'sizes, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
          small
        />
      </div>
    </el-card>

    <el-dialog v-model="isDialogVisible" title="更新 URL 前缀" width="500px">
      <span>
        此操作将根据服务器最新配置，更新所有文件的下载链接前缀。当您更换了域名或IP地址后，可以使用此功能。
      </span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdate">确认更新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import request from '../utils/request';
import { ElMessage, ElCheckbox } from 'element-plus';
import { FolderOpened, Refresh, Document, Link, Download, Memo } from '@element-plus/icons-vue';

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
const selectedFiles = ref<FileItem[]>([]);
const isMobile = ref(false);
const mobileListRef = ref<HTMLElement | null>(null);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const isSelected = (file: FileItem) => {
  return selectedFiles.value.some(selected => selected.fileId === file.fileId);
};

const toggleSelection = (file: FileItem) => {
  if (isSelected(file)) {
    selectedFiles.value = selectedFiles.value.filter(selected => selected.fileId !== file.fileId);
  } else {
    selectedFiles.value.push(file);
  }
};

const fetchFileList = async () => {
  loading.value = true;
  try {
    const response = await request.get(`/fileList?page=${currentPage.value}&size=${pageSize.value}`);
    if (response.data?.code === 1) {
      const pageResult = response.data.data;
      fileList.value = pageResult.records || [];
      totalItems.value = pageResult.total || 0;
    } else {
      ElMessage.error(response.data?.msg || '获取文件列表失败');
    }
  } catch (error) {
    ElMessage.error('获取文件列表失败，请检查网络');
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: FileItem[]) => {
  selectedFiles.value = selection;
};

const copyToClipboard = (text: string, message: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(message);
  }).catch(err => {
    ElMessage.error('复制失败: ' + err);
  });
};

const batchCopyMarkdown = () => {
  const text = selectedFiles.value.map(f => `[${f.fileName}](${f.downloadUrl})`).join('\n');
  copyToClipboard(text, `已批量复制 ${selectedFiles.value.length} 个 Markdown 链接`);
};

const batchCopyLinks = () => {
  const text = selectedFiles.value.map(f => f.downloadUrl).join('\n');
  copyToClipboard(text, `已批量复制 ${selectedFiles.value.length} 个下载链接`);
};

const formatUploadTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', { hour12: false });
};

const openUpdateDialog = () => {
  isDialogVisible.value = true;
};

const confirmUpdate = async () => {
  isDialogVisible.value = false;
  const loading = ElMessage({ message: '正在更新...', type: 'info', duration: 0 });
  try {
    const response = await request.put('/file-url');
    if (response.data?.code === 1) {
      ElMessage.success('URL 更新成功');
      fetchFileList();
    } else {
      ElMessage.error(response.data?.msg || 'URL 更新失败');
    }
  } catch (error) {
    ElMessage.error('更新失败，请检查网络');
  } finally {
    loading.close();
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedFiles.value = []; // Clear selection on page change
  fetchFileList();
  if (isMobile.value && mobileListRef.value) {
    mobileListRef.value.scrollTop = 0; // Scroll to top on page change
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  selectedFiles.value = []; // Clear selection on size change
  fetchFileList();
};

const copyMarkdown = (row: FileItem) => {
  copyToClipboard(`[${row.fileName}](${row.downloadUrl})`, 'Markdown 格式已复制');
};

const copyLink = (row: FileItem) => {
  copyToClipboard(row.downloadUrl, '下载链接已复制');
};

const openLink = (url: string) => {
  window.open(url, '_blank');
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchFileList();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden; /* Prevent card from overflowing page */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
}

:deep(.el-card__body) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* Important for layout */
}

.el-table {
  flex-grow: 1;
}

.footer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0; /* Prevent footer from shrinking */
}

.batch-actions {
  display: flex;
  gap: 10px;
}

/* Mobile List View Styles */
.mobile-file-list {
  padding: 10px;
  flex-grow: 1;
  overflow-y: auto; /* Enable scrolling for the list itself */
}

.mobile-file-item {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--el-box-shadow-light);
  transition: background-color 0.3s, border-color 0.3s;
  cursor: pointer;
}

.mobile-file-item.is-selected {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.mobile-file-item .file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
}

.mobile-checkbox {
  margin-right: 8px;
}

.file-icon {
  font-size: 1.2em;
}

.mobile-file-item .file-name-mobile {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-file-item .file-meta {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  gap: 5px;
  padding-left: 40px; /* Align with file name */
}

.mobile-file-item .file-actions {
  display: flex;
  justify-content: flex-end;
}

/* Responsive styles for FileList.vue */
@media (max-width: 767px) {
  .page-container {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card-header .header-right {
    width: 100%;
  }

  .card-header .el-button {
    width: 100%;
  }

  .footer-toolbar.is-mobile {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 15px 10px;
  }

  .batch-actions {
    width: 100%;
    display: flex;
    gap: 10px;
  }

  .batch-actions .el-button {
    flex-grow: 1;
    width: 0; /* Allow button to shrink */
  }

  .el-pagination {
    width: 100%;
    justify-content: center;
  }

  :deep(.el-pagination .el-pagination__sizes) {
    margin: 0;
  }
}
</style>
