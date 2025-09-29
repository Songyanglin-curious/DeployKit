<template>
    <n-card title="配置信息">
        <n-form ref="formRef" :model="configData" :rules="rules">


            <!-- 环境列表 -->
            <n-form-item label="环境列表" path="envs">
                <n-tag v-for="env in configData.envs" :key="env" style="margin-right: 8px;">
                    {{ env }}
                </n-tag>
            </n-form-item>

            <!-- 备份和更新路径表格 -->
            <n-form-item label="备份和更新路径配置">
                <n-table :bordered="true" :single-line="false">
                    <thead>
                        <tr>
                            <th>环境</th>
                            <th>备份路径</th>
                            <th>更新路径</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="env in configData.envs" :key="env">
                            <td>{{ env }}</td>
                            <td>
                                <n-input v-model:value="configData.backupAndUpdate.backup[env]" readonly />
                            </td>
                            <td>
                                <n-input v-model:value="configData.backupAndUpdate.update[env]" readonly />
                            </td>
                        </tr>
                    </tbody>
                </n-table>
            </n-form-item>
        </n-form>

    </n-card>
</template>

<script setup lang="ts">

import { ConfigData } from '@/types/config';
import { toRefs } from 'vue';

const props = defineProps<{
    configData: ConfigData
}>();
const { configData } = toRefs(props);
console.log(configData);
console.log(configData.value.envs);

const rules = {}


</script>