<template>
    <ConfigTemplate v-model="localConfigData" @validate="handleValidate" ref="configTemplateRef" :disabled="true" />
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRaw } from 'vue';
import ConfigTemplate from '@components/ConfigTemplate.vue';
import { ConfigData } from '@/types/config';

const props = defineProps<{
    configData: ConfigData
}>();

// 使用 ref 而不是 reactive
const localConfigData = ref<ConfigData>({ ...props.configData });

const configTemplateRef = ref<InstanceType<typeof ConfigTemplate> | null>(null);

// 监听 props.configData 的变化并更新本地数据
watch(
    () => props.configData,
    (newConfigData) => {
        console.log('检测到 configData 变化，更新本地数据:', newConfigData);
        localConfigData.value = { ...newConfigData };
    },
    { deep: true, immediate: true }
);

const handleValidate = (result: any) => {
    console.log('验证结果:', result);
}

// 暴露方法给父组件
defineExpose({
    validateConfig: () => configTemplateRef.value?.validate(),
    getConfigData: () => toRaw(localConfigData.value)
})
</script>
