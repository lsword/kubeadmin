<template>
  <div class="container">
<p></p>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClusterStore } from '@/store';

const router = useRouter();
const route = useRoute();

const clustername = ref('');
clustername.value = route.params.name as string;
const clusterStore = useClusterStore();

clusterStore.select(clustername.value);
router.push(`/cluster/overview`);

</script>

<style scoped lang="less">
</style>