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
        <n-flex align="center">
            <n-input v-model:value="updatePackagePath" @click="selectUpdatePackagePath" placeholder="选择开发环境更新包根路径" readonly style="width: 100%" />

        </n-flex>
        <n-flex align="center">
            <n-input v-model:value="targetPackagePath" @click="selectTargetPackagePath" placeholder="选择更新包保存路径" readonly style="width: 100%" />

        </n-flex>
        <n-flex align="center">
            <n-button :loading="loading" @click="generatePackage()">
                生成更新包
            </n-button>
        </n-flex>
        <n-collapse>
            <n-collapse-item title="项目配置" name="1">
                <ConfigView :config-data="projectConfig"></ConfigView>
            </n-collapse-item>
        </n-collapse>

    </n-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import ConfigView from '@/components/ConfigView.vue'
import { ConfigData } from '@/types/config'
const message = useMessage()
const loading = ref(false);
const projectName = ref('选择项目');
const projectConfig = ref<ConfigData>({
    desc: {},
    envs: [],
    backupAndUpdate: {
        backup: {},
        update: {}
    }
});
let options: any[] = [];
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
        options.push(...response.map((item: any) => ({ label: item, value: item })));

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



const refreshProjectConfig = async (value: string) => {
    console.log("选择的项目：", value)
    //  获取配置项
    try {
        const config = await window.electronAPI.getProjectConfig(value);
        projectConfig.value = config;
    } catch (error) {

    }
};

const updatePackagePath = ref('');

const selectUpdatePackagePath = async () => {
    try {
        const result = await window.electronAPI.getSelectFolderPath({
            title: '选择开发环境更新包根路径',
            defaultPath: updatePackagePath.value
        });
        if (result.success) {
            updatePackagePath.value = result.path;
            unTargetSetDefault(updatePackagePath.value);
        } else if (result.state == "error") {
            message.warning(result.message);
        }
    } catch (error) {
        message.error('选择文件夹失败:' + error);
        console.error('选择文件夹失败:', error);
    }
};
const unTargetSetDefault = (updatePath: string) => {
    if (!targetPackagePath.value) {
        //如果目标路径为空，则默认设置为更新包路径的上一级
        targetPackagePath.value = getParentPath(updatePath);
    }
}
const getParentPath = (path: string) => {
    if (!path) return ''
    // 处理Windows路径分隔符
    // const normalizedPath = path.replace(/\\/g, '\\')
    const lastIndex = path.lastIndexOf('\\')
    return lastIndex > 0 ? path.substring(0, lastIndex) : path
}
const targetPackagePath = ref('');

const selectTargetPackagePath = async () => {
    try {
        const result = await window.electronAPI.getSelectFolderPath({
            title: '选择更新包保存路径',
            defaultPath: targetPackagePath.value
        });
        if (result.success) {
            targetPackagePath.value = result.path;
        } else if (result.state == "error") {
            message.warning(result.message);
        }
    } catch (error) {
        message.error('选择文件夹失败:' + error);
        console.error('选择文件夹失败:', error);
    }
};

const refresProject = async () => {
    loading.value = true;
    init();

    loading.value = false;
}

const generatePackage = async () => {
    try {
        // 先对参数做校验
        if (!projectName.value) {
            message.error('请选择项目');
            return;
        }
        if (!projectConfig.value) {
            message.error('请填写项目配置');
            return;
        }
        if (!updatePackagePath.value) {
            message.error('请选择开发环境更新包根路径');
            return;
        }
        if (!targetPackagePath.value) {
            message.error('请选择更新包保存路径');
            return;
        }
        // 转换为普通对象确保可序列化
        const plainConfig = JSON.parse(JSON.stringify(projectConfig.value))
        const result = await window.electronAPI.generatePackage(
            updatePackagePath.value,
            targetPackagePath.value,
            projectName.value,
            plainConfig,
            "web"
        );
        if (result.success) {
            message.success(result.message);
        } else {
            message.warning(result.message);
        }
    } catch (error) {
        message.error('根据环境变量生成不同更新包更新文件失败:' + error);
        console.error('根据环境变量生成不同更新包更新文件失败:', error);
    }
}

init();


</script>

<style scoped lang="scss"></style>