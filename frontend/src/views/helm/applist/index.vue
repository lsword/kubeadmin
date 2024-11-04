<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb>
        <a-link href='/helm/applist'>
          {{$t('applist.breadcrumb.applist')}}
        </a-link>
      </a-breadcrumb>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="helmApps" :loading="loading">
          <template #columns>
            <a-table-column :title="$t('applist.table.name')" data-index="name">
              <template #cell="{ record }">
                <a-link @click="handleViewApp(record)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column :title="$t('applist.table.revision')" data-index="revision"></a-table-column>
            <a-table-column :title="$t('applist.table.updatetime')" data-index="updated"></a-table-column>
            <a-table-column :title="$t('applist.table.status')" data-index="status"></a-table-column>
            <a-table-column :title="$t('applist.table.chart')" data-index="chart"></a-table-column>
            <a-table-column :title="$t('applist.table.appversion')" data-index="app_version"></a-table-column>
            <a-table-column :title="$t('applist.table.operation')">
              <template #cell="{record}">
                <a-button type="text" size="small" @click="handleDelete(record)">
                  {{$t('applist.table.operation.delete')}}
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
    <a-modal v-model:visible="deleteConfirmModalVisible" @ok="handleDeleteOk" @cancel="handleDeleteCancel">
      <template #title>
        {{ $t('applist.deletemodal.title') }}
      </template>
      <div>{{ $t('applist.deletemodal.confirmInfo') }}</div>
      <div>{{ $t('applist.deletemodal.appname') }}: {{ curAppName }}</div>
      <div>{{ $t('applist.deletemodal.namespace') }}: {{ clusterStore.curNamespace }}</div>
      <div>{{ $t('applist.deletemodal.cluster') }}: {{ clusterStore.name }}</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClusterStore } from '@/store';
import { getHelmAppList, deleteHelmApp, HttpResponse } from '@/api/cluster';
import useLoading from '@/hooks/loading';

import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const deleteConfirmModalVisible = ref(false);
const curAppName = ref("");

const helmApps = ref();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const fetchHelmApps = async () => {
  checkStoreData();
  try {
    const result: HttpResponse = await getHelmAppList(clusterStore.id!, clusterStore.curNamespace!);
    console.log(result.msg);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    helmApps.value = result.data;
  } catch (error) {
    console.error('Failed to fetch Helm releases:', error);
  }
};

const handleViewApp = (record: any) => {
  router.push(`/helm/app/${record.name}`);
};

const handleDelete = async (record:any) => {
  curAppName.value = record.name;
  deleteConfirmModalVisible.value = true;
};

const handleDeleteOk = async () => {
  const result = await deleteHelmApp(curAppName.value, clusterStore.id!, clusterStore.curNamespace!);
  await fetchHelmApps();
}

const handleDeleteCancel = async () => {
  deleteConfirmModalVisible.value = false;
}

onMounted(() => {
  fetchHelmApps();
});

clusterStore.$subscribe((mutation, state) => {
  fetchHelmApps();
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