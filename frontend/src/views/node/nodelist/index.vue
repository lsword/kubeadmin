<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        Node
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="nodeList" :loading="loading">
          <template #columns>
            <a-table-column :title="$t('nodelist.table.name')" data-index="name"></a-table-column>
            <a-table-column :title="$t('nodelist.table.status')" data-index="status"></a-table-column>
            <a-table-column :title="$t('nodelist.table.arch')" data-index="arch"></a-table-column>
            <a-table-column :title="$t('nodelist.table.kernelVersion')" data-index="kernelVersion"></a-table-column>
            <a-table-column :title="$t('nodelist.table.osRelease')" data-index="osRelease"></a-table-column>
            <a-table-column :title="$t('nodelist.table.runtimeVersion')" data-index="runtimeVersion"></a-table-column>
            <a-table-column :title="$t('nodelist.table.k8sVersion')" data-index="k8sVersion"></a-table-column>
            <a-table-column :title="$t('nodelist.table.createtime')" data-index="createTime"></a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import api, { Cluster, K8sPod } from '@/api/cluster';
import { getNodeList } from '@/api/cluster';
import type { HttpResponse } from '@/api/http';
import useLoading from '@/hooks/loading';
import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const nodeList = ref();

const nodeStatus = (conditions: any[])=>{
  let status = "NotReady";
  conditions.forEach((condition: any)=>{
    if (condition.type === 'Ready' && condition.status !== 'False') status = "Ready";
  })
  return status;
}

// fetchNodeList
const fetchNodeList = async () => {
  checkStoreData();
  setLoading(true);
  try {
    nodeList.value = [];
    const result: HttpResponse = await getNodeList(clusterStore.id!);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    // nodeList.value = result.data;
    (result.data as any[]).forEach((node: any)=>{
      const currentTime = new Date();
      const nodeData = {
        name: node.metadata && node.metadata.name ? node.metadata.name : '',
        status: nodeStatus(node.status.conditions),
        arch: node.status.nodeInfo.architecture, 
        kernelVersion: node.status.nodeInfo.kernelVersion, 
        osRelease: node.status.nodeInfo.osImage,
        runtimeVersion: node.status.nodeInfo.containerRuntimeVersion, 
        k8sVersion: node.status.nodeInfo.kubeletVersion, 
        createTime: node.metadata && node.metadata.creationTimestamp ? date.formatTimeDiff(new Date(node.metadata.creationTimestamp),currentTime) : '',
      };
      nodeList.value!.push(nodeData);
    })
  } catch (error) {
    console.error('Failed to fetch nodees:', error);
  }
  setLoading(false);
}

onMounted(() => {
  fetchNodeList();
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