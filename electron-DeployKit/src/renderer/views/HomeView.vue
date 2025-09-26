<template>
    <n-flex vertical>
        <n-flex align="center">
            <n-popselect v-model:value="projectName" :options="options" trigger="click" scrollable @update:value="refreshProjectConfig">
                <n-button>{{ projectName || '弹出选择' }}</n-button>
            </n-popselect>

            <n-button :loading="loading" @click="refresProject()">
                刷新
            </n-button>
        </n-flex>
        <!-- <n-collapse>
            <n-collapse-item title="项目配置" name="1"> -->
        <ConfigManagement :config-data="projectConfig"></ConfigManagement>
        <!-- </n-collapse-item>

        </n-collapse> -->

    </n-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfigManagement from '@components/ConfigManagement.vue'

const loading = ref(false);
const projectName = ref('选择项目');
const projectConfig = ref({});
const options = [];
const init = async () => {

    await initOptions();

    setDefaultSelectValue();
    refreshProjectConfig(projectName.value);
}
const initOptions = async () => {
    try {
        // 清空选项
        options.length = 0;
        const response = await window.electronAPI.getConfigFiles();
        options.push(...response.map(item => ({ label: item, value: item })));

    } catch {
        new Error('获取配置文件失败');
    } finally {

    }
}
// 所选值不在选项中，则选择第一个为默认的选项
const setDefaultSelectValue = () => {
    if (options.length > 0) {
        const haveValue = options.some(item => item.value === projectName.value);
        if (!haveValue) {
            projectName.value = options[0].value;
        }
    }
}



const refreshProjectConfig = async (value) => {
    console.log("选择的项目：", value)
    //  获取配置项
    try {
        const config = await window.electronAPI.getProjectConfig(value);
        projectConfig.value = config;
    } catch (error) {

    }
};

const refresProject = async () => {
    loading.value = true;
    init();

    loading.value = false;
}

init();
</script>

<style scoped lang="scss"></style>
