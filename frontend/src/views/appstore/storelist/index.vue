<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb>
        <a-link href='/appstore/storelist'>
          {{$t('storelist.breadcrumb.storelist')}}
        </a-link>
      </a-breadcrumb>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="appStores" :loading="loading">
          <template #columns>
            <a-table-column :title="$t('storelist.table.name')">
              <template #cell="{ record }">
                <a-link @click="handleViewAppStore(record)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column :title="$t('storelist.table.type')" data-index="type"></a-table-column>
            <a-table-column :title="$t('storelist.table.address')" data-index="address"></a-table-column>
            <a-table-column :title="$t('storelist.table.operation')">
              <template #cell="{record}">
                <a-button type="text" size="small" @click="handleDelete(record)">
                  {{$t('storelist.table.operation.delete')}}
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
import { getAppStoreList } from '@/api/cluster';
import useLoading from '@/hooks/loading';

import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();

const appStores = ref();

const handleViewAppStore = (record: any) => {
  router.push(`/appstore/storeapplist/${record.id}`);
};

const handleDelete = (record:any) => {
};

const fetchAppStores = async () => {
  try {
    const result = await getAppStoreList();
    appStores.value = result.data;
    console.log(appStores.value);
  } catch (error) {
    console.error('Failed to fetch app stores:', error);
  }
};

onMounted(() => {
  fetchAppStores();
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