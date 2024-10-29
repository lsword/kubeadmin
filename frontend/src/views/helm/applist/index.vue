<template>
  <div class="container">
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
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import { getHelmAppList } from '@/api/cluster';
import useLoading from '@/hooks/loading';

import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();

const helmApps = ref();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const handleViewApp = (record: any) => {
  // router.push(`/workload/pod/${record.name}`);
};

const handleDelete = (record:any) => {
};

const fetchHelmApps = async () => {
  checkStoreData();
  try {
    const result = await getHelmAppList(clusterStore.id!, clusterStore.curNamespace!);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    helmApps.value = result.data;
    console.log(helmApps.value);
  } catch (error) {
    console.error('Failed to fetch Helm releases:', error);
  }
};

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