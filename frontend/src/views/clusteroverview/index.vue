<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <h1>{{ cluster.name }}</h1>
        <p><strong>ID:</strong> {{ cluster.id }}</p>
        <p><strong>Status:</strong> {{ cluster.status }}</p>
        <p><strong>Created At:</strong> {{ cluster.created_at }}</p>
        <div v-if="loading">
        </div>
        <div v-else>
          <div v-if="!loading">
            <a-card>
              <template #title>概况</template>
              <a-grid :cols="24" :col-gap="16" :row-gap="16" style="margin-top: 16px">
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 8, xl: 8, xxl: 8 }"
                >
                  <ChainItem
                    title="应用"
                    quota="share"
                    chart-type="pie"
                    class="app-item"
                    :card-style="{
                    background: theme === 'dark'
                      ? ' linear-gradient(180deg, #3D492E 0%, #263827 100%)'
                      : 'linear-gradient(180deg, #F5FEF2 0%, #E6FEEE 100%)',
                    }" 
                    :chartData="appChartData"
                  />
                  <ChainItem
                    title="POD"
                    quota="share"
                    chart-type="pie"
                    class="pod-item"
                    :card-style="{
                    background: theme === 'dark'
                      ? ' linear-gradient(180deg, #3D492E 0%, #263827 100%)'
                      : 'linear-gradient(180deg, #F5FEF2 0%, #E6FEEE 100%)',
                    }"
                    :chartData="podChartData"
                  />
                  </a-grid-item>
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 16, xl: 16, xxl: 16 }"
                >
                  <DataPanel 
                    :appNum="nsAppNum"
                    :podNum="nsPodNum"
                    :serviceNum="nsServiceNum"
                    :pvcNum="nsPvcNum"
                    :deploymentNum="nsDeploymentNum"
                    :daemonsetNum="nsDaemonsetNum"
                    :statefulsetNum="nsStatefulsetNum"
                    :ingressNum="nsIngressNum"
                    :configmapNum="nsConfigmapNum"
                    :secretNum="nsSecretNum"
                  />
                </a-grid-item>
              </a-grid>
            </a-card>
          </div>
          <div v-if="appCpuData.length > 0">
            <a-card>
              <template #title>CPU</template>
              <a-grid :cols="24" :col-gap="16" :row-gap="16" style="margin-top: 16px">
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
                >
                  <ResCPUUsagePiePanel resType="cpu" title="cpu" :appData="appCpuData" :podData="podCpuData" />
                </a-grid-item>
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
                >
                  <ResUsageBarPanel resType="cpu" title="cpu" :appData="appCpuData" :podData="podCpuData" />
                </a-grid-item>
              </a-grid>
            </a-card>
          </div>
          <div v-if="appMemData.length > 0">
            <a-card>
              <template #title>内存</template>
              <a-grid :cols="24" :col-gap="16" :row-gap="16" style="margin-top: 16px">
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
                >
                  <ResCPUUsagePiePanel resType="cpu" title="cpu" :appData="appCpuData" :podData="podCpuData" />
                </a-grid-item>
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
                >
                  <ResUsageBarPanel resType="cpu" title="cpu" :appData="appCpuData" :podData="podCpuData" />
                </a-grid-item>
              </a-grid>
            </a-card>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore, useClusterStore } from '@/store';
import api, { Cluster } from '@/api/cluster'; // Import your API functions
import useLoading from '@/hooks/loading';

import DataPanel from './components/data-panel.vue';
import ChainItem from './components/chart-item.vue';
import ResUsagePiePannel from './components/resusage-pie-panel.vue';
import ResUsageBarPannel from './components/resusage-bar-panel.vue';

const { loading, setLoading } = useLoading();

const router = useRouter();

const clusterStore = useClusterStore();

const appStore = useAppStore();
const theme = computed(() => {
  return appStore.theme;
});


const cluster = ref({
  id: '',
  name: '',
  status: '',
  created_at: '',
  // Add more fields as needed
});

const appChartData = ref<any>([]);
const podChartData = ref<any>([]);
const appCpuData = ref<any>([]);
const podCpuData = ref<any>([]);
const appMemData = ref<any>([]);
const podMemData = ref<any>([]);



const nsAppNum = ref(0);
const nsPodNum = ref(0);
const nsServiceNum = ref(0);
const nsPvcNum = ref(0);
const nsDeploymentNum = ref(0);
const nsDaemonsetNum = ref(0);
const nsStatefulsetNum = ref(0);
const nsIngressNum = ref(0);
const nsConfigmapNum = ref(0);
const nsSecretNum = ref(0);

setLoading(false);

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
    cluster.value = result.data as Cluster;
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