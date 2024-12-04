<template>
  <div class="file-list-container">
    <div class="header">
      <h2 class="title">文件列表</h2>
      <!-- 添加更新URL按钮 -->
      <el-button type="warning" size="small" @click="openUpdateDialog">更新URL</el-button>
    </div>

    <!-- 使用 el-table 展示文件列表 -->
    <el-table :data="fileList" v-loading="loading" style="width: 100%" stripe height="450">
      <el-table-column prop="fileName" label="文件名" width="200" show-overflow-tooltip />
      <el-table-column label="下载链接" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link :href="row.downloadUrl" target="_blank">{{ row.downloadUrl }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" width="100" />
      <el-table-column prop="fileId" label="文件 ID" width="150" show-overflow-tooltip />
      <el-table-column label="上传时间" width="180">
        <template #default="{ row }">
          {{ formatUploadTime(row.uploadTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 更新URL确认对话框 -->
    <el-dialog
      title="警告"
      v-model="isDialogVisible"
      width="30%"
      center
    >
      <p>更新URL是更新数据库中的网址前缀，也就是更新外链的网址，适用于更换了域名后，直接访问文件列表中的URL，请求不能到达服务器的情况。</p>
      <p class="dialog-footer">是否更新URL？</p>
      <span slot="footer" class="dialog-footer" >
        <el-button @click="isDialogVisible = false">否</el-button>
        <el-button type="primary" @click="confirmUpdate">是</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 定义状态变量
const fileList = ref([]); // 初始化 fileList 为一个空数组
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const isDialogVisible = ref(false); // 控制对话框显示状态

// 获取文件列表数据
const fetchFileList = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/fileList?page=${currentPage.value}&size=${pageSize.value}`);
    
    // 检查返回结果并提取数据
    if (response.data && response.data.code === 1) { // code === 1 表示成功
      const pageResult = response.data.data; // 提取 data 字段中的分页数据
      fileList.value = pageResult.records || []; // 提取 records，若为空则使用空数组
      totalItems.value = pageResult.total || 0; // 提取 total，若为空则为 0
    } else {
      console.error('获取文件列表失败:', response.data.msg || '未知错误');
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化上传时间
const formatUploadTime = (uploadTime) => {
  return new Date(uploadTime * 1000).toLocaleString();
};

// 打开对话框
const openUpdateDialog = () => {
  isDialogVisible.value = true;
};

// 确认更新
const confirmUpdate = async () => {
  try {
    const response = await axios.put('/api/file-url');
    if (response.data && response.data.code === 1) {
      console.log('URL更新成功');
      fetchFileList(); // 更新文件列表
    } else {
      console.error('URL更新失败:', response.data.msg || '未知错误');
    }
  } catch (error) {
    console.error('更新URL失败:', error);
  } finally {
    isDialogVisible.value = false;
  }
};

// 处理分页更改
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchFileList();
};

// 处理页面大小更改
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchFileList();
};

// 在组件挂载时获取文件列表
onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.file-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.8rem;
  color: #333;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  flex-direction:row;   /* 垂直排列子元素 */
  align-items: center;      /* 水平居中 */
  justify-content: center;  /* 垂直居中 */
  height: 100%;             /* 让容器高度充满 */
  text-align: center;
}
</style>
