<template>
  <n-card title="路径配置" class="card card-full">
    <template #header-extra>
      <n-icon>
        <settings-outline />
      </n-icon>
    </template>

    <n-form-item label="测试环境路径">
      <n-input :value="testEnvPath" readonly />
    </n-form-item>

    <n-form-item label="备份文件夹路径">
      <n-input :value="backupFolderPath" readonly />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SettingsOutline } from '@vicons/ionicons5'
import { NCard, NIcon, NFormItem, NInput } from 'naive-ui'

const testEnvPath = ref('/test/env/path')
const backupFolderPath = ref('/backup/folder/path')
</script>

<style scoped>
.card-full {
  grid-column: 1 / -1;
}
</style>
