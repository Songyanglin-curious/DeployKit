<template>
  <n-card title="项目选择" class="card">
    <template #header-extra>
      <n-icon>
        <folder-outline />
      </n-icon>
    </template>

    <n-form-item label="选择项目">
      <n-select
        v-model:value="selectedProject"
        :options="projectOptions"
        placeholder="-- 请选择项目 --"
      />
    </n-form-item>

    <n-form-item label="项目路径">
      <n-input-group>
        <n-input :value="projectPath" readonly />
        <n-button secondary @click="changeProjectPath">
          更改
        </n-button>
      </n-input-group>
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FolderOutline } from '@vicons/ionicons5'
import { NCard, NIcon, NFormItem, NSelect, NInput, NInputGroup, NButton } from 'naive-ui'

const selectedProject = ref('')
const projectPath = ref('/projects/default')

const projectOptions = [
  {
    label: '项目A - 生产环境',
    value: 'project-a'
  },
  {
    label: '项目B - 测试环境',
    value: 'project-b'
  }
]

async function changeProjectPath() {
  // TODO: 实现更改项目路径逻辑
}
</script>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}
</style>
