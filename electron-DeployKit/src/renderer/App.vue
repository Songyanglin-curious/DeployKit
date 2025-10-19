<template>


    <n-message-provider>
        <n-modal-provider>
            <n-dialog-provider>
                <HomeView />
            </n-dialog-provider>
        </n-modal-provider>
    </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NModalProvider, NDialogProvider } from 'naive-ui'
import HomeView from '@/views/HomeView.vue'
</script>

<style>
/* 全局样式 */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}
</style>
