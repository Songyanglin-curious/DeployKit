<template>
    <div class="config-page">
        <n-card title="系统配置管理" class="config-card">
            <!-- 描述信息展示 -->
            <n-descriptions label-placement="left" bordered :column="1" class="desc-section">
                <n-descriptions-item v-for="(desc, key) in configData.desc" :key="key" :label="getFieldLabel(key)">
                    {{ desc }}
                </n-descriptions-item>
            </n-descriptions>

            <!-- 路径配置表单 -->
            <n-form ref="formRef" :model="formValue" label-placement="left" label-width="auto" require-mark-placement="right-hanging" class="config-form">
                <n-grid :cols="3" :x-gap="24">
                    <!-- 环境选择器 -->
                    <n-form-item-gi :span="3" label="当前环境">
                        <n-select v-model:value="currentEnv" :options="envOptions" placeholder="请选择环境" />
                    </n-form-item-gi>

                    <!-- 备份路径 -->
                    <n-form-item-gi :span="3" label="备份路径">
                        <n-input v-model:value="formValue.backup" placeholder="请输入备份路径" readonly class="path-input">
                            <template #suffix>
                                <n-button text @click="selectBackupPath">
                                    <n-icon>
                                        <FolderOpenOutline />
                                    </n-icon>
                                </n-button>
                            </template>
                        </n-input>
                    </n-form-item-gi>

                    <!-- 更新路径 -->
                    <n-form-item-gi :span="3" label="更新路径">
                        <n-input v-model:value="formValue.update" placeholder="请输入更新路径" readonly class="path-input">
                            <template #suffix>
                                <n-button text @click="selectUpdatePath">
                                    <n-icon>
                                        <FolderOpenOutline />
                                    </n-icon>
                                </n-button>
                            </template>
                        </n-input>
                    </n-form-item-gi>
                </n-grid>

                <!-- 所有环境路径概览表格 -->
                <n-divider>所有环境路径配置</n-divider>
                <n-data-table :columns="tableColumns" :data="tableData" :bordered="false" class="path-table" />
            </n-form>

            <!-- 操作按钮 -->
            <template #footer>
                <div class="action-buttons">
                    <n-button type="primary" @click="enableEditing" v-if="!isEditing">
                        编辑配置
                    </n-button>
                    <n-space v-else>
                        <n-button type="primary" @click="saveConfig">
                            保存配置
                        </n-button>
                        <n-button @click="cancelEditing">
                            取消
                        </n-button>
                    </n-space>
                    <n-button @click="exportConfig" secondary>
                        导出配置
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, toRefs } from 'vue'
import { FolderOpenOutline } from '@vicons/ionicons5'
const props = defineProps(['configData'])
defineProps({
    configData: Object
})
// 如果注入的数据可能是undefined，可以提供默认值
if (!configData) {
    throw new Error('配置数据未提供')
}
// 响应式数据
const currentEnv = ref('虚拟机')
const isEditing = ref(false)
const formRef = ref(null)

// 配置数据
const configData = reactive(toRefs(configData))

// 表单值（根据当前环境动态显示）
const formValue = computed(() => ({
    backup: configData.backupAndUpdate.backup[currentEnv.value] || '',
    update: configData.backupAndUpdate.update[currentEnv.value] || ''
}))

// 环境选项
const envOptions = computed(() =>
    configData.envs.map(env => ({ label: env, value: env }))
)

// 表格数据
const tableData = computed(() =>
    configData.envs.map(env => ({
        env,
        backup: configData.backupAndUpdate.backup[env],
        update: configData.backupAndUpdate.update[env]
    }))
)

// 表格列定义
const tableColumns = [
    {
        title: '环境',
        key: 'env',
        width: 100
    },
    {
        title: '备份路径',
        key: 'backup',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '更新路径',
        key: 'update',
        ellipsis: {
            tooltip: true
        }
    }
]

// 方法
const getFieldLabel = (key) => {
    const labels = {
        env: '环境变量种类描述',
        backupAndUpdate: '备份更新路径描述',
        backup: '备份路径描述',
        update: '更新路径描述'
    }
    return labels[key] || key
}

const selectBackupPath = async () => {
    if (!isEditing.value) return

    try {
        const result = await window.electronAPI?.selectFolder('选择备份路径')
        if (result) {
            configData.backupAndUpdate.backup[currentEnv.value] = result
        }
    } catch (error) {
        console.error('选择路径失败:', error)
    }
}

const selectUpdatePath = async () => {
    if (!isEditing.value) return

    try {
        const result = await window.electronAPI?.selectFolder('选择更新路径')
        if (result) {
            configData.backupAndUpdate.update[currentEnv.value] = result
        }
    } catch (error) {
        console.error('选择路径失败:', error)
    }
}

const enableEditing = () => {
    isEditing.value = true
}

const saveConfig = async () => {
    try {
        // 调用 Electron API 保存配置
        await window.electronAPI?.saveConfig(configData)
        isEditing.value = false
        // 可以添加成功提示
    } catch (error) {
        console.error('保存配置失败:', error)
    }
}

const cancelEditing = () => {
    isEditing.value = false
    // 可以添加重新加载配置的逻辑
}

const exportConfig = () => {
    // 导出配置逻辑
    console.log('导出配置:', configData)
}

// 初始化时加载配置
onMounted(async () => {
    try {
        const savedConfig = await window.electronAPI?.getConfig()
        if (savedConfig) {
            Object.assign(configData, savedConfig)
        }
    } catch (error) {
        console.error('加载配置失败:', error)
    }
})
</script>

<style scoped>
.config-page {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

.config-card {
    margin-bottom: 20px;
}

.desc-section {
    margin-bottom: 24px;
}

.config-form {
    margin-top: 24px;
}

.path-input {
    width: 100%;
}

.path-table {
    margin-top: 16px;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.n-divider {
    margin: 24px 0;
}
</style>