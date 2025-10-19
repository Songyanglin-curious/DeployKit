<template>
    <n-card title="项目名称" size="small">
        <n-flex align="center">
            <n-input v-model:value="localProjectName" placeholder="请输入项目名称" style="flex:1" />
            <!-- <n-button :loading="loading" @click="validateProjectName()" type="info">
                校验
            </n-button> -->
        </n-flex>
    </n-card>


    <n-alert type="error" v-if="showAlert">
        {{ alertContent }}
    </n-alert>

    <ConfigTemplate v-model="localConfigData" ref="configTemplateRef" :disabled="false" />
    <n-flex align="center" justify="center">

        <n-button @click="save()" type="primary" style="width: 50%;">
            保存
        </n-button>
    </n-flex>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRaw, computed } from 'vue';
import ConfigTemplate from '@components/ConfigTemplate.vue';
import { ConfigData } from '@/types/config';
import { useMessage } from 'naive-ui'
import { API } from '@/api/electronAPI'
import { formatConfigData, getConfigTemplate } from '@/utils/config';

const props = defineProps({
    projectName: {
        type: String,
        default: ''
    },
    configData: {
        type: Object as () => ConfigData,
        default: () => getConfigTemplate()
    },
    onSuccess: Function,
    onCancel: Function
})

const message = useMessage();
const localProjectName = ref(props.projectName);
const getProjectName = () => localProjectName.value.trim();
// 使用 ref 而不是 reactive
const localConfigData = ref<ConfigData>(props.configData);

const configTemplateRef = ref<InstanceType<typeof ConfigTemplate> | null>(null);

const loading = ref(false);

const alertContent = ref('');
const showAlert = computed(() => !!alertContent.value);
const validateProjectName = async () => {
    try {
        const projectName = getProjectName();
        if (!projectName) {
            alertContent.value = '项目名称不能为空';
            return false;
        }
        loading.value = true;
        const response = await API.getConfigFiles();

        if (response.includes(projectName)) {
            alertContent.value = `项目名称 [${projectName}] 已存在`;
            return false;
        } else {
            message.success('项目名称可用');
            alertContent.value = '';
            return true;
        }

    } catch {
        new Error('获取配置文件失败');
    } finally {
        loading.value = false;
    }
}
// validateProjectName();

const save = async () => {
    try {
        loading.value = true;
        const projectName = getProjectName();
        // const validateProjectNameResult = await validateProjectName();
        // if (!validateProjectNameResult) {
        //     message.error('项目名称不可用，请重新输入');
        //     return;
        // }
        const validateResult = await configTemplateRef.value?.validate();
        if (validateResult.isValid) {
            const formatData = formatConfigData(JSON.parse(JSON.stringify(localConfigData.value)));
            await API.saveProjectConfig(projectName, formatData);
            if (props.projectName !== projectName) {
                await API.deleteProjectConfig(props.projectName);
            }
            message.success('保存成功');
            props.onSuccess?.();
        } else {
            message.error('配置信息有误，请检查');
        }
    } catch (error: any) {
        message.error('保存失败', error);
    }
}

</script>
