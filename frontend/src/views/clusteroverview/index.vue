<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
      <h1>{{ cluster.name }}</h1>
      <p><strong>ID:</strong> {{ cluster.id }}</p>
      <p><strong>Status:</strong> {{ cluster.status }}</p>
      <p><strong>Created At:</strong> {{ cluster.created_at }}</p>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClusterStore } from '@/store';
import api from '@/api/cluster'; // Import your API functions

const router = useRouter();

const clusterStore = useClusterStore();

const cluster = ref({
  id: '',
  name: '',
  status: '',
  created_at: '',
  // Add more fields as needed
});

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const fetchClusterOverview = async () => {
  // const clusterId = route.params.id as string;
  console.log(router.currentRoute.value.name)
  checkStoreData();
  try {
    const result = await api.getClusterOverview(clusterStore.id as string);
    cluster.value = result.data;
    console.log(result.data);
  } catch (error) {
    console.error('Failed to fetch cluster details:', error);
  }
};

onMounted(() => {
  fetchClusterOverview();
});

</script>

<style lang="less" scoped>

  .container {
    padding: 10px;
  }

  .layout :deep(.arco-layout-content)  {
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-white);
    font-size: 16px;
    font-stretch: condensed;
    text-align: center;
  }

</style>