<template>
  <n-card title="更新设置" class="card">
    <template #header-extra>
      <n-icon>
        <refresh-outline />
      </n-icon>
    </template>

    <n-form-item label="更新文件夹">
      <n-input-group>
        <n-input :value="updateFolderPath" readonly />
        <n-button secondary @click="selectUpdateFolder">
          选择
        </n-button>
      </n-input-group>
    </n-form-item>

    <n-form-item label="检测规则">
      <n-radio-group v-model:value="detectionRule">
        <n-space>
          <n-radio value="latest-folder">最新文件夹</n-radio>
          <n-radio value="name-pattern">按命名规则</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RefreshOutline } from '@vicons/ionicons5'
import { NCard, NIcon, NFormItem, NInput, NInputGroup, NButton, NRadioGroup, NRadio, NSpace } from 'naive-ui'

const updateFolderPath = ref('/updates/latest')
const detectionRule = ref('latest-folder')

async function selectUpdateFolder() {
  // TODO: 实现选择更新文件夹逻辑
}
</script>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}
</style>
