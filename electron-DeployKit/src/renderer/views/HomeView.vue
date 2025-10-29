<template>
    <n-flex vertical>
        <n-card>


            <n-flex align="center" justify="space-between" class="mb10">
                <n-flex align="center">
                    <n-popselect v-model:value="projectName" :options="options" trigger="click" scrollable @update:value="refreshProjectConfig">
                        <n-button>{{ projectName || '弹出选择' }}</n-button>
                    </n-popselect>

                    <n-button :loading="loading" @click="refresProject()">
                        刷新
                    </n-button>
                </n-flex>

                <n-flex align="center">
                    <n-button @click="editProjectConfig()">
                        编辑配置
                    </n-button>
                    <n-button @click="insertProjectConfig()">
                        新增配置
                    </n-button>
                    <n-button type="warning" @click="deleteProjectConfig()">
                        删除配置
                    </n-button>
                    <n-button @click="getConfigPath()">
                        获取配置文件路径
                    </n-button>
                </n-flex>

            </n-flex>
            <n-flex align="center" class="mb10">
                <n-input v-model:value="updatePackagePath" @click="selectUpdatePackagePath" placeholder="选择开发环境更新包根路径" readonly style="width: 100%" />

            </n-flex>
            <n-flex align="center" class="mb10">
                <n-input v-model:value="targetPackagePath" @click="selectTargetPackagePath" placeholder="选择更新包保存路径" readonly style="width: 100%" />

            </n-flex>
            <n-flex align="center">
                <n-button type="primary" @click="generatePackage()" style="width: 100%;">
                    生成更新包
                </n-button>
            </n-flex>
        </n-card>
        <n-collapse>
            <!-- <n-collapse-item title="详细配置" name="1"> -->
            <ConfigView :config-data="projectConfig"></ConfigView>
            <!-- </n-collapse-item> -->
        </n-collapse>

    </n-flex>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useDialog, useMessage, useModal } from 'naive-ui'

import { API } from '@/api/electronAPI'
import ConfigView from '@components/ConfigView.vue'
import ConfigInsert from '@/components/ConfigInsert.vue'
import ConfigEdit from '@/components/ConfigEdit.vue'
import { ConfigData } from '@/types/config'
import { getConfigTemplate } from '@/utils/config'
const message = useMessage();
const modal = useModal();
const dialog = useDialog();
const loading = ref(false);
const projectName = ref('选择项目');
const projectConfig = ref<ConfigData>(getConfigTemplate());
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
        const response = await API.getConfigFiles();
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
        const config = await API.getProjectConfig(value);
        projectConfig.value = config;
    } catch (error) {

    }
};

const updatePackagePath = ref('');

const selectUpdatePackagePath = async () => {
    try {
        const result = await API.getSelectFolderPath({
            title: '选择开发环境更新包根路径',
            defaultPath: updatePackagePath.value
        });
        updatePackagePath.value = result;
        targetPackagePath.value = getParentPath(updatePackagePath.value);
    } catch (error) {

    }
};

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
        const result = await API.getSelectFolderPath({
            title: '选择更新包保存路径',
            defaultPath: targetPackagePath.value
        });
        if (result.success) {
            targetPackagePath.value = result;
        }
    } catch (error) {

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
        const result = await API.generatePackage(
            updatePackagePath.value,
            targetPackagePath.value,
            projectName.value,
            plainConfig,

        );
        message.success("打包文件生成成功！");
    } catch (error) {
        message.error('根据环境变量生成不同更新包更新文件失败:' + error);
        console.error('根据环境变量生成不同更新包更新文件失败:', error);
    }
}
const getConfigPath = async function () {
    try {
        const result = await API.getConfigPath();
        // 写入粘贴板
        navigator.clipboard.writeText(result);
        message.success("配置文件路径已复制到粘贴板！");
    } catch (error) {
        message.error('获取配置文件路径失败:' + error);

    }
}

init();

const insertProjectConfig = () => {
    const m = modal.create({
        title: '新增配置',
        preset: 'card',
        style: {
            width: '100vw',
            height: '100vh',
            overflow: 'auto',
        },
        content: () => h(
            ConfigInsert,
            {
                onSuccess: () => {
                    console.log('提交成功，关闭 modal')
                    m.destroy() // 关闭 modal
                    init();
                },
                onCancel: () => {
                    console.log('取消操作，关闭 modal')
                    m.destroy() // 关闭 modal
                }

            }
        ),
    })
}
const editProjectConfig = () => {
    const m = modal.create({
        title: `编辑配置[${projectName.value}]`,
        preset: 'card',
        style: {
            width: '100vw',
            height: '100vh',
            overflow: 'auto',
        },
        content: () => h(
            ConfigEdit,
            {
                projectName: projectName.value,
                configData: projectConfig.value,
                onSuccess: () => {
                    console.log('提交成功，关闭 modal')
                    m.destroy() // 关闭 modal
                    init();
                },
                onCancel: () => {
                    console.log('取消操作，关闭 modal')
                    m.destroy() // 关闭 modal
                }

            }
        ),
    })
}
const deleteProjectConfig = () => {
    dialog.warning({
        title: `删除配置[${projectName.value}]`,
        content: `
        删除后，该项目的配置将无法恢复，请谨慎操作！`,
        positiveText: '删除',
        negativeText: '取消',
        draggable: false,
        onPositiveClick: async () => {
            try {
                await API.deleteProjectConfig(projectName.value);
                message.success('删除成功');
                init();
            } catch (error) {
                message.error('删除失败:' + error);
            }
        },
        onNegativeClick: () => {

        }
    })

}

</script>

<style scoped lang="scss">
.mb10 {
    margin-bottom: 10px;
}
</style>