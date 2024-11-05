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
        <div class="table-header">
          <a-button type="primary" @click="showAddAppStoreModal = true">
            {{$t('storelist.button.addAppStore')}}
          </a-button>
        </div>
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
    <a-modal
      v-model:visible="showAddAppStoreModal"
      :title="$t('storelist.modal.addAppStore.ModalTitle')"
      @ok="handleAddAppStore"
    >
      <a-form :model="newAppStore">
        <a-form-item :label="$t('storelist.modal.addAppStore.appStoreName')">
          <a-input v-model="newAppStore.name" />
        </a-form-item>
        <a-form-item :label="$t('storelist.modal.addAppStore.appStoreAddress')">
          <a-input v-model="newAppStore.address" />
        </a-form-item>
        <a-form-item :label="$t('storelist.modal.addAppStore.appStoreType')">
          <a-select v-model="newAppStore.type" default-value="registry">
            <a-option value="chartmuseum">ChartMuseum</a-option>
            <a-option value="harbor">Harbor</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="testConnection">{{$t('storelist.modal.addAppStore.testConnection')}}</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getAppStoreList, testAppStoreConnection, addAppStore } from '@/api/cluster';
import useLoading from '@/hooks/loading';

import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();

const appStores = ref();

const showAddAppStoreModal = ref(false);
const newAppStore = reactive({
  name: '',
  address: '',
  type: 'chartmuseum',
});

const fetchAppStores = async () => {
  try {
    const result = await getAppStoreList();
    appStores.value = result.data;
    console.log(appStores.value);
  } catch (error) {
    console.error('Failed to fetch app stores:', error);
  }
};

const handleAddAppStore = async () => {
  /*
  try {
    const response = await addAppStore(newAppStore.value);
    if (response.status === 0) {
      // Handle success, e.g., refresh the app store list
      showAddAppStoreModal.value = false;
    } else {
      // Handle error
      console.error(response.msg);
    }
  } catch (error) {
    console.error('Failed to add app store:', error);
  }
    */
  if (!newAppStore.name || !newAppStore.name.length) return;
  if (!newAppStore.address || !newAppStore.address.length) return;
  
  const formData = new FormData();
  formData.append('name', newAppStore.name);
  formData.append('address', newAppStore.address);
  formData.append('type', newAppStore.type);

  try {
    await addAppStore(formData);
  } catch (error) {
    /*
    if (error instanceof Error) {
      // Message.error(error.message);
      Message.error(localtext('cluster.addcluster.error.noconnection'));

      // console.log(t);
      // Message.error(t('cluster.addcluster.error.noconnection'));
    } else {
      Message.error('An unknown error occurred.');
    }
      */
  }
  fetchAppStores();
};

const testConnection = async () => {
  /*
  try {
    const response = await testAppStoreConnection(newAppStore.value);
    if (response.status === 0) {
      // Connection successful
      console.log('Connection successful');
    } else {
      // Connection failed
      console.error(response.msg);
    }
  } catch (error) {
    console.error('Failed to test connection:', error);
  }
    */
};

const handleViewAppStore = (record: any) => {
  router.push(`/appstore/storeapplist/${record.id}`);
};

const handleDelete = (record:any) => {
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
  .table-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
</style>