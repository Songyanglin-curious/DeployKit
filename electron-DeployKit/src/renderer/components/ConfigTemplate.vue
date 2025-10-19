<template>
    <n-form :model="model" :rules="rules" ref="formRef" :disabled="props.disabled">

        <n-card title="环境配置" size="small">
            <n-form-item label="环境类型" path="envs" class="env-item" :show-feedback="false">
                <n-dynamic-tags :value="model.envs" @update:value="handleEnvsUpdate" />
            </n-form-item>
            <div v-for="(env, index) in model.envs" :key="index" class="env-item">
                <n-h3>{{ env }}</n-h3>
                <n-grid :cols="2" :x-gap="24">
                    <n-gi>
                        <n-form-item :label="`${env} - 备份路径`" :path="`backup.${env}`">
                            <n-input :value="model.backup[env]" @update:value="handleFieldUpdate('backup', env, $event)" :placeholder="`请输入${env}的备份路径`" @blur="handleInputChange" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item :label="`${env} - 更新路径`" :path="`update.${env}`">
                            <n-input :value="model.update[env]" @update:value="handleFieldUpdate('update', env, $event)" :placeholder="`请输入${env}的更新路径`" @blur="handleInputChange" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item :label="`${env} - 数据库配置路径`" :path="`dbConfig.${env}`">
                            <n-input :value="model.dbConfig[env]" @update:value="handleFieldUpdate('dbConfig', env, $event)" :placeholder="`请输入${env}的数据库配置路径`" @blur="handleInputChange" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item :label="`${env} - 启用Bin`" :path="`Bin.${env}`">
                            <n-switch :value="model.Bin[env]" @update:value="handleFieldUpdate('Bin', env, $event)" />
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="2">
                        <n-form-item :label="`${env} - 敏感文件列表`" :path="`fragileFiles.${env}`">
                            <n-dynamic-tags :value="model.fragileFiles[env]" @update:value="handleFilesUpdate(env, $event)" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
            </div>
        </n-card>
    </n-form>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
    NForm,
    NFormItem,
    NInput,
    NCard,
    NH3,
    NGrid,
    NGi,
    NSwitch,
    NDynamicTags,
    useMessage
} from 'naive-ui'

const message = useMessage()
const formRef = ref(null)

// 使用 Vue 3.4 的 defineModel
const model = defineModel({
    type: Object,
    default: () => ({
        envs: [],
        backup: {},
        update: {},
        dbConfig: {},
        Bin: {},
        fragileFiles: {}
    })
})

// 定义 props
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['validate'])

// 处理环境数组更新
const handleEnvsUpdate = (newEnvs) => {
    model.value = {
        ...model.value,
        envs: newEnvs
    }
    triggerValidation()
}

// 处理字段更新
const handleFieldUpdate = (field, env, value) => {
    model.value = {
        ...model.value,
        [field]: {
            ...model.value[field],
            [env]: value
        }
    }
    triggerValidation()
}

// 处理文件列表更新
const handleFilesUpdate = (env, files) => {
    model.value = {
        ...model.value,
        fragileFiles: {
            ...model.value.fragileFiles,
            [env]: files
        }
    }
    triggerValidation()
}



// 处理输入变化
const handleInputChange = () => {
    triggerValidation()
}

// 触发验证
const triggerValidation = () => {
    nextTick(() => {
        validate().then(result => {
            emit('validate', result)
        })
    })
}

// 校验规则
const rules = computed(() => {
    const rules = {}

    if (!model.value.envs || model.value.envs.length === 0) {
        return rules
    }

    model.value.envs.forEach((env) => {
        // 备份路径规则
        rules[`backup.${env}`] = [
            {
                required: true,
                message: `${env}环境的备份路径不能为空`,
                trigger: ['input', 'blur']
            },
            {
                validator: (rule, value) => {
                    return value && value.startsWith('/')
                },
                message: '路径必须以 / 开头',
                trigger: ['input', 'blur']
            }
        ]

        // 更新路径规则
        rules[`update.${env}`] = [
            {
                required: true,
                message: `${env}环境的更新路径不能为空`,
                trigger: ['input', 'blur']
            },
            {
                validator: (rule, value) => {
                    return value && value.startsWith('/')
                },
                message: '路径必须以 / 开头',
                trigger: ['input', 'blur']
            }
        ]

        // 数据库配置路径规则
        rules[`dbConfig.${env}`] = [
            {
                required: true,
                message: `${env}环境的数据库配置路径不能为空`,
                trigger: ['input', 'blur']
            },
            {
                validator: (rule, value) => {
                    return value && value.startsWith('/')
                },
                message: '路径必须以 / 开头',
                trigger: ['input', 'blur']
            }
        ]
    })

    return rules
})

// 暴露给父组件的方法
const validate = async () => {
    try {
        await formRef.value?.validate()
        const result = {
            isValid: true,
            data: model.value,
            errors: null
        }
        return result
    } catch (errors) {
        const result = {
            isValid: false,
            data: model.value,
            errors: errors
        }
        return result
    }
}

const resetValidation = () => {
    formRef.value?.restoreValidation()
}

const getFormData = () => {
    return model.value
}

// 暴露方法给父组件
defineExpose({
    validate,
    resetValidation,
    getFormData
})

// 监听表单数据变化，实时触发验证
watch(model, (newValue) => {
    triggerValidation()
}, { deep: true })

// 初始化时触发一次验证
onMounted(() => {
    if (model.value.envs && model.value.envs.length > 0) {
        triggerValidation()
    }
})
</script>

<style scoped>
.env-item {
    margin-bottom: var(--n-padding-bottom);
    padding: var(--n-padding-bottom);
    border: 1px solid #d9d9d9;
    border-radius: 6px;
}

.env-item:last-child {
    margin-bottom: 0;
}
</style>
