<template>
    <HomeView />
    <!-- <n-config-provider>
    <n-message-provider>
    
    </n-message-provider>
  </n-config-provider> -->

</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
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
