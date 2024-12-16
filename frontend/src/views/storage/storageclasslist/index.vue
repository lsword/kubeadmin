<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        Storage
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        StorageClasses
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="storageClassList" :loading="loading">
          <template #columns>
            <a-table-column :title="$t('Name')" data-index="name"></a-table-column>
            <a-table-column :title="$t('Provisioner')" data-index="provisioner"></a-table-column>
            <a-table-column :title="$t('ReclaimPolicy')" data-index="reclaimPolicy"></a-table-column>
            <a-table-column :title="$t('VolumeBindingMode')" data-index="volumeBindingMode"></a-table-column>
            <a-table-column :title="$t('AllowVolumeExpansion')" data-index="allowVolumeExpansion"></a-table-column>
            <a-table-column :title="$t('CreateTime')" data-index="createTime"></a-table-column>
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
import { getStorageClassList } from '@/api/cluster';
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

const storageClassList = ref();

// getStorageClassList
const fetchStorageClassList = async () => {
  checkStoreData();
  setLoading(true);
  try {
    storageClassList.value = [];
    const result: HttpResponse = await getStorageClassList(clusterStore.id!);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    // storageClassList.value = result.data;
    (result.data as any[]).forEach((storageClass: any)=>{
      const currentTime = new Date();
      const storageClassData = {
        name: storageClass.metadata && storageClass.metadata.name ? storageClass.metadata.name : '',
        provisioner: storageClass.provisioner ? storageClass.provisioner : '',
        reclaimPolicy: storageClass.reclaimPolicy ? storageClass.reclaimPolicy : '',
        volumeBindingMode: storageClass.volumeBindingMode ? storageClass.volumeBindingMode : '',
        allowVolumeExpansion: storageClass.allowVolumeExpansion ? storageClass.allowVolumeExpansion : '',
        createTime: storageClass.metadata && storageClass.metadata.creationTimestamp ? date.formatTimeDiff(new Date(storageClass.metadata.creationTimestamp),currentTime) : '',
      };
      storageClassList.value!.push(storageClassData);
    })
  } catch (error) {
    console.error('Failed to fetch StorageClasses:', error);
  }
  setLoading(false);
}

onMounted(() => {
  fetchStorageClassList();
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