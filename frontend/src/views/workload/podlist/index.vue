<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        {{ $t('podlist.breadcrumb.workload') }}
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-link href='/kubeadmin/workload/podlist'>
          Pods
        </a-link>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="k8sPodList" :loading="loading">
          <template #columns>
            <a-table-column>
              <template #cell="{ record }">
                <div class="status-container">
                  <span v-if="record.status === 'Running'" class="circle running"></span>
                  <span v-if="record.status === 'Pending'" class="circle pending"></span>
                  <span v-else class="circle failed"></span>
                </div>
              </template>
            </a-table-column>
            <a-table-column :title="$t('podlist.table.name')" data-index="name" :width=400>
              <template #cell="{ record }">
                <a-link @click="handleViewPod(record)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column :title="$t('podlist.table.node')" data-index="node"></a-table-column>
            <a-table-column :title="$t('podlist.table.ip')" data-index="podIP"></a-table-column>
            <a-table-column :title="$t('podlist.table.status')" data-index="status"></a-table-column>
            <a-table-column :title="$t('podlist.table.restartnum')" data-index="restart"></a-table-column>
            <a-table-column :title="$t('podlist.table.createtime')" data-index="createTime"></a-table-column>
            <a-table-column :title="$t('podlist.table.operation')" :width=200>
              <template #cell="{record}">
                <a-button type="text" size="small" @click="handleAccess(record)">
                  {{$t('podlist.table.operation.access')}}
                </a-button>
                <a-button type="text" size="small" @click="handleViewLog(record)">
                  {{$t('podlist.table.operation.viewlog')}}
                </a-button>
                <a-button type="text" size="small" @click="handleDelete(record)">
                  {{$t('podlist.table.operation.delete')}}
                </a-button>
                <a-button type="text" size="small" @click="handleForceDelete(record)">
                  {{$t('podlist.table.operation.forcedelete')}}
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
    <a-modal :visible="showDeleteConfirm" @ok="handleModalDeleteConfirm" @cancel="handleModalDeleteCancel" :title="'确认删除'" >
      确定要删除名称为{{podToDelete.name}}的这个pod吗？
    </a-modal>
    <a-modal :visible="showForceDeleteConfirm" @ok="handleModalForceDeleteConfirm" @cancel="handleModalForceDeleteCancel" :title="'确认强制删除'" >
      确定要强制删除名称为{{podToDelete.name}}的这个pod吗？
      <p style="color: red; font-weight: bold;">
        注意：强制删除可能会有风险，请谨慎操作!
      </p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import api, { Cluster, K8sPod } from '@/api/cluster';
import useLoading from '@/hooks/loading';
import date from '@/utils/date';

const { t: localtext } = useI18n();

const router = useRouter();
const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();

const k8sPodList = ref<K8sPod[]>();
const showDeleteConfirm = ref(false); 
const showForceDeleteConfirm = ref(false);
const podToDelete = ref<any>({});

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const fetchPodsInNamespace = async () => {
  checkStoreData();
  try {
    k8sPodList.value = [];
    setLoading(true);
    const result = await api.getPodList(clusterStore.id!, clusterStore.curNamespace!);
    (result.data as K8sPod[]).forEach((pod: any)=>{
      const labels = pod.metadata && pod.metadata.labels ? Object.entries(pod.metadata.labels).map(([key, value]) => `${key}:${value}   `) : {};
      const currentTime = new Date();
      const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
      const containers = pod.spec.containers.map((container: any) => container.name);
      let podStatus = '';
      if (pod.metadata && pod.metadata.deletionTimestamp)
        podStatus = 'Terminating';
      else
        podStatus = pod.status && pod.status.phase ? pod.status.phase : '';
      const podData = {
        name: pod.metadata && pod.metadata.name ? pod.metadata.name : '',
        label: labels,
        node: pod.spec && pod.spec.nodeName ? pod.spec.nodeName : 'none',
        status: podStatus,
        restart: pod.status && pod.status.containerStatuses && pod.status.containerStatuses[0] ? pod.status.containerStatuses[0].restartCount : 0,
        createTime: podCreateTime,
        // controllerName: controllerNameOfPod,
        showAllLabels: false,
        // containers: containers,
        podIP: pod.status &&  pod.status.podIP ? pod.status.podIP : '',
      };
      k8sPodList.value!.push(podData);
    })
  } catch (error) {
    console.error('Failed to fetch pods:', error);
  }
  setLoading(false);
};

const handleViewPod = (record: any) => {
  // router.push(`/workload/pod/${record.name}/${record.controllerName}`);
  router.push(`/workload/pod/${record.name}`);
};
const handleAccess = (record:any) => {
};
const handleViewLog = (record:any) => {
};

const handleDelete = async (record: { name: any; }) => {
  podToDelete.value = record; 
  showDeleteConfirm.value = true;
}

const handleModalDeleteConfirm = async () => {
  const result = await api.deletePod(clusterStore.id!, clusterStore.curNamespace!, podToDelete.value.name, "false");
  showDeleteConfirm.value = false;
  fetchPodsInNamespace();
};

const handleModalDeleteCancel = async () => {
  showDeleteConfirm.value = false;
};

const handleForceDelete = async (record:any) => {
  podToDelete.value = record; 
  showForceDeleteConfirm.value = true;
}

const handleModalForceDeleteConfirm = async () => {
  const result = await api.deletePod(clusterStore.id!, clusterStore.curNamespace!, podToDelete.value.name, "true");
  showForceDeleteConfirm.value = false;
  fetchPodsInNamespace();
};

const handleModalForceDeleteCancel = async () => {
  showForceDeleteConfirm.value = false;
};

clusterStore.$subscribe((mutation, state) => {
  fetchPodsInNamespace();
})

onMounted(() => {
  fetchPodsInNamespace();
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

  .circle {
    display: inline-block;
    margin-right: -200px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    &.failed {
      background-color: rgb(var(--red-6));
    }
    &.running {
      background-color: rgb(var(--green-6));
    }
    &.pending {
      background-color: rgb(var(--yellow-6));
    }
  }

</style>