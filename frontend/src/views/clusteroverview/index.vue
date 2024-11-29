<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
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
                  <ResUsagePiePanel resType="cpu" title="cpu" :appData="appCpuData" :podData="podCpuData" />
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
                  <ResUsagePiePanel resType="mem" title="mem" :appData="appMemData" :podData="podMemData" />
                </a-grid-item>
                <a-grid-item
                  :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
                >
                  <ResUsageBarPanel resType="mem" title="mem" :appData="appMemData" :podData="podMemData" />
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
import ResUsagePiePanel from './components/resusage-pie-panel.vue';
import ResUsageBarPanel from './components/resusage-bar-panel.vue';

const { loading, setLoading } = useLoading();

const router = useRouter();

const clusterStore = useClusterStore();

const appStore = useAppStore();
const theme = computed(() => {
  return appStore.theme;
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

const fetchNamespaceMetrics = async (clusterid: string, namespace: string) => {
  const metrics = await api.getNameSpaceMetrics(clusterid, namespace);
    
  appCpuData.value = [];
  appMemData.value = [];
  podCpuData.value = [];
  podMemData.value = [];

  if (metrics.data) {
    metrics.data.forEach((appMetrics: any) => {
      appCpuData.value.push({ value: appMetrics.cpu, name: appMetrics.name })
      appMemData.value.push({ value: appMetrics.mem, name: appMetrics.name })
      appMetrics.pods.forEach((podMetrics: any)=>{
        podCpuData.value.push({ value: podMetrics.cpu, name: podMetrics.name })
        podMemData.value.push({ value: podMetrics.mem, name: podMetrics.name })
      })
    })
  }
};

const fetchNamespaceTotalResources = async (clusterid: string, namespace: string) => {
  try {
    const appStatusData:{
      deployed: number;
      failed: number;
      pending: number;
      superseded: number;
      uninstalling: number;
    }={deployed:0, failed:0, pending:0, superseded:0, uninstalling:0};
    const podStatusData:{
      pending: number;
      running: number;
      succeeded: number;
      failed: number;
      unknown: number;
    }={pending:0, running:0, succeeded:0, failed:0, unknown:0};

    setLoading(true);
    const totalResources = await api.getNameSpaceResources(clusterid, namespace);
    totalResources.data.apps.forEach((appMetrics: any)=>{
      if (appMetrics.status === 'deployed') appStatusData.deployed +=1;
      if (appMetrics.status === 'failed') appStatusData.failed +=1;
      if (appMetrics.status === 'pending') appStatusData.pending +=1;
      if (appMetrics.status === 'superseded') appStatusData.superseded +=1;
      if (appMetrics.status === 'uninstalling') appStatusData.uninstalling +=1;
      });

      totalResources.data.pods.forEach((podMetrics: any)=>{
        if (podMetrics.status.phase === 'Pending') podStatusData.pending +=1;
        else if (podMetrics.status.phase === 'Running') podStatusData.running +=1;
        else if (podMetrics.status.phase === 'Succeeded') podStatusData.succeeded +=1;
        else if (podMetrics.status.phase === 'Failed') podStatusData.failed +=1;
        else if (podMetrics.status.phase === 'Unknown') podStatusData.unknown +=1;
        else podStatusData.unknown +=1;
      })
    appChartData.value.push({ value: appStatusData.deployed, name: 'deployed', itemStyle: {color: "#00B42A"}})
    appChartData.value.push({ value: appStatusData.failed, name: 'failed', itemStyle: {color: "#F77234"}})
    appChartData.value.push({ value: appStatusData.pending, name: 'pending', itemStyle: {color: "#3491FA"}})
    appChartData.value.push({ value: appStatusData.superseded, name: 'superseded', itemStyle: {color: "#F7BA1E"}})
    appChartData.value.push({ value: appStatusData.uninstalling, name: 'uninstalling', itemStyle: {color: "#14C9C9"}})
    podChartData.value.push({ value: podStatusData.pending, name: 'pending', itemStyle: {color: "#3491FA"}})
    podChartData.value.push({ value: podStatusData.running, name: 'running', itemStyle: {color: "#00B42A"}})
    podChartData.value.push({ value: podStatusData.succeeded, name: 'succeeded', itemStyle: {color: "#F7BA1E"}})
    podChartData.value.push({ value: podStatusData.failed, name: 'failed', itemStyle: {color: "#F77234"}})
    podChartData.value.push({ value: podStatusData.unknown, name: 'unknown', itemStyle: {color: "#14C9C9"}})
    nsPodNum.value = totalResources.data.pods.length;
    nsAppNum.value = totalResources.data.apps.length;
    nsServiceNum.value = totalResources.data.service;
    nsPvcNum.value = totalResources.data.PVC;
    nsDeploymentNum.value = totalResources.data.deployment;
    nsDaemonsetNum.value = totalResources.data.daemonSet;
    nsStatefulsetNum.value = totalResources.data.statefulSet;
    nsIngressNum.value = totalResources.data.ingress;
    nsConfigmapNum.value = totalResources.data.configmap;
    nsSecretNum.value = totalResources.data.secret;
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  fetchNamespaceMetrics(clusterStore.id as string, clusterStore.curNamespace as string);
  fetchNamespaceTotalResources(clusterStore.id as string, clusterStore.curNamespace as string);
});
clusterStore.$subscribe((mutation, state) => {
  fetchNamespaceMetrics(clusterStore.id as string, clusterStore.curNamespace as string);
  fetchNamespaceTotalResources(clusterStore.id as string, clusterStore.curNamespace as string);
})

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