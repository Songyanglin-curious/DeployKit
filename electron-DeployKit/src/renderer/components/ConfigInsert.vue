<template>
    <div>
        <ConfigTemplate></ConfigTemplate>
    </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

import ConfigTemplate from '@components/ConfigTemplate.vue';
import { ConfigData } from '@/types/config';


const props = defineProps<{
    configData: ConfigData
}>();
const { configData } = toRefs(props);
console.log(configData);
console.log(configData.value.envs);

const rules = {}


</script>