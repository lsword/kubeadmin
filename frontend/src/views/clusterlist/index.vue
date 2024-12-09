<template>
  <div class="container">
    <div class="layout-navbar">
      <NavBar />
    </div>
    <a-layout class="layout-content" style="padding: 40px 0px 0px 0px">
      <a-layout style="padding: 20px; ">
        <div style="display: flex; justify-content: space-between; align-items: center; color: #fff; padding: 0px 0px 20px 0px">
          <div style="font-size: 18px; font-weight: bold; color: #1890ff;"></div>
          <a-button type="primary" @click="showModal = true">增加集群</a-button>
        </div>

        <a-table :columns="columns" :data="clusters" row-key="id" >
          <template #columns>
            <a-table-column :title="$t('cluster.table.name')" data-index="name">
              <template #cell="{ record }">
                <a-link @click="handleSelectCluster(record.id)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column :title="$t('cluster.table.address')" data-index="address"></a-table-column>
            <a-table-column :title="$t('cluster.table.version')" data-index="version"></a-table-column>
            <a-table-column :title="$t('cluster.table.addtime')" data-index="created_at"></a-table-column>
            <a-table-column :title="$t('cluster.table.operation')">
              <template #cell="{ record }">
                <a-button type="primary" @click=handleDeleteCluster(record.id)>{{$t('cluster.table.operation.delete')}}</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-layout>
    </a-layout>

    <a-modal v-model:visible="showModal" title="增加集群" @ok="handleAddCluster" @cancel="resetForm">
      <a-form :model="clusterForm" :auto-label-width="true">
        <a-form-item label="集群名称">
          <a-input v-model="newClusterName" placeholder="请输入集群名称" />
        </a-form-item>
        <a-form-item label="集群证书">
          <a-upload
            action="/kubeadmin/api/k8s/upload"
            :file-list="fileList"
            :limit="1"
            @change="handleFileChange"
            @remove="handleFileRemove"
          >
          </a-upload>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleTestConnection">测试连接</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>

</template>

<script lang="ts" setup>

import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import type { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import api, { Cluster } from '@/api/cluster';
import NavBar from '@/components/navbar/index.vue';
import { useRouter } from 'vue-router';
import { useClusterStore } from '@/store';

const router = useRouter();

const { t: localtext } = useI18n();

const clusterStore = useClusterStore();

const clusterForm = reactive({
  name: '',
  post: '',
  isRead: false,
});

const columns = ref([
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
]);

const clusters = ref<Cluster[]>([]);

const showModal = ref(false);
const newClusterName = ref('');
const fileList = ref<FileItem[]>([]);

const handleFileChange = (fileItemList: FileItem[], _fileItem: FileItem) => {
  fileList.value = fileItemList;
};

const handleFileRemove = () => {
  fileList.value = [];
};

const handleTestConnection = async () => {
  if (fileList.value.length === 0) {
    Message.error('请上传集群证书');
    return;
  }

  const t = fileList.value[0].file as Blob;
  const filecontent = await t.text();
  const formData = new FormData();
  formData.append('config', filecontent);

  try {
    const result = await api.testConnection(formData);
    console.log(result)
    Message.success(result.data.msg);
  } catch (error) {
    // Message.error(error);
  }
};

const resetForm = () => {
  newClusterName.value = '';
  fileList.value = [];
  showModal.value = false;
};

const fetchClusters = async () => {
  try {
    const result = await api.getClusters();
    clusters.value = (result.data as Cluster[]).map((cluster: Cluster) => ({
      id: cluster.id,
      name: cluster.name,
      address: cluster.address,
      version: cluster.version,
      created_at: cluster.created_at,
      status: 'Running', // Assuming all clusters are running; adjust as needed
    }));
    console.log(clusters.value)
  } catch (error) {
    if (error instanceof Error) {
      Message.error(error.message);
    } else {
      Message.error('An unknown error occurred.');
    }
  }
};

const handleAddCluster = async () => {

  if (!newClusterName.value || !fileList.value.length) return;
  console.log(newClusterName.value)
  const configFile = fileList.value[0].file as Blob;
  
  const filecontent = await configFile.text();
  const formData = new FormData();
  formData.append('config', filecontent);
  formData.append('name', newClusterName.value);

  try {
    await api.addCluster(formData);
  } catch (error) {
    if (error instanceof Error) {
      // Message.error(error.message);
      Message.error(localtext('cluster.addcluster.error.noconnection'));

      // console.log(t);
      // Message.error(t('cluster.addcluster.error.noconnection'));
    } else {
      Message.error('An unknown error occurred.');
    }
  }
  fetchClusters();
};

const handleDeleteCluster = async (clusterId:string) => {
  try {
    await api.deleteCluster(clusterId);
    clusters.value = clusters.value.filter(cluster => cluster.id !== clusterId);
    Message.success('Cluster deleted successfully.');
  } catch (error) {
    if (error instanceof Error) {
      Message.error(error.message);
    } else {
      Message.error('An unknown error occurred.');
    }
  }
  fetchClusters();
};

const handleSelectCluster = async (clusterId:string) => {
  console.log(clusterId);
  await clusterStore.select(clusterId);
  router.push(`/cluster/overview`);
}

onMounted(() => {
  fetchClusters();
});

</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px;
    padding-bottom: 0;
    display: flex;
  }

/*
  a-layout-header {
    background: #001529;
    color: #fff;
  }
  */
  @nav-size-height: 60px;
  @layout-max-width: 1100px;

  .layout {
    width: 100%;
    height: 100%;
  }

  .layout-navbar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: @nav-size-height;
  }
  .layout-content {
    min-height: 100vh;
    overflow-y: hidden;
    // background-color: var(--color-fill-2);
    background-color: var(--color-bg-2);
    transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  }
</style>