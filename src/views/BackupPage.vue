<template>
  <div class="backup-container">
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <span>数据库备份</span>
        </div>
      </template>

      <el-button 
        type="primary" 
        @click="handleBackup"
        :loading="backupLoading"
      >
        <el-icon><Download /></el-icon>
        <span>下载数据库备份</span>
      </el-button>

      <el-upload
        ref="uploadRef"
        class="upload-container"
        :before-upload="beforeUpload"
        :show-file-list="false"
        :auto-upload="false"
        accept=".db"
        :on-change="(file) => handleUpload(file.raw)"
      >
        <el-button type="success" @click="triggerUpload" :loading="restoreLoading">
          <el-icon><Upload /></el-icon>
          <span>恢复数据库</span>
        </el-button>
      </el-upload>

      <div class="backup-tips">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
        >
          <p>点击按钮将下载最新的数据库备份文件</p>
          <p>备份文件为SQLite格式，可直接用于恢复数据</p>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Download, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const backupLoading = ref(false)
const restoreLoading = ref(false)
const uploadRef = ref(null)

const triggerUpload = () => {
  uploadRef.value.$refs['upload-inner'].handleClick()
}

const beforeUpload = (file) => {
  const isDB = file.type === 'application/octet-stream' || file.name.endsWith('.db')
  if (!isDB) {
    ElMessage.error('只能上传.db格式的数据库文件')
    return false
  }
  return true
}

const handleUpload = async (file) => {
  try {
    restoreLoading.value = true
    const formData = new FormData()
    formData.append('multipartFile', file)
    
    const response = await request({
      url: '/backup/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '数据库恢复失败')
    }
    
    ElMessage.success('数据库恢复成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    restoreLoading.value = false
  }
}

const handleBackup = async () => {
  try {
    backupLoading.value = true
    const response = await request({
      url: '/backup/download',
      method: 'get',
      responseType: 'blob'
    })
    
    // 直接使用响应数据创建 Blob
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'tgDrive.db')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据库备份下载成功')
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  } finally {
    backupLoading.value = false
  }
}
</script>

<style scoped>
.backup-container {
  padding: 20px;
}

.backup-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.upload-container {
  margin-top: 20px;
}

.backup-tips {
  margin-top: 20px;
}
</style>
