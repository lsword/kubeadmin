<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        {{ $t('deploymentlist.breadcrumb.workload') }}
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-link href='/kubeadmin/workload/deploymentlist'>
          Deployments
        </a-link>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-table :data="k8sDeploymentList" :loading="loading">
          <template #columns>
            <a-table-column :title="$t('deploymentlist.table.name')" data-index="name" :width=400>
              <template #cell="{ record }">
                <a-link @click="handleViewDeployment(record)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column :title="$t('deploymentlist.table.replicas')" data-index="replicas"></a-table-column>
            <a-table-column :title="$t('deploymentlist.table.image')">
              <template #cell="{record}">
                <div v-for="images in record.image" :key="images">
                  {{ images }}
                </div>
              </template>
            </a-table-column>
            <a-table-column :title="$t('deploymentlist.table.createtime')" data-index="createTime"></a-table-column>
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
import useLoading from '@/hooks/loading';
import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();

const k8sDeploymentList = ref<any[]>();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const fetchDeploymentsInNamespace = async () => {
  checkStoreData();
  setLoading(true);
  try {
    k8sDeploymentList.value = [];
    const result = await api.getDeploymentList(clusterStore.id!, clusterStore.curNamespace!);
    result.data.forEach((deployment: any)=>{
      const labels = deployment.metadata && deployment.metadata.labels ? Object.entries(deployment.metadata.labels).map(([key, value]) => `${key}:${value}   `) : {};
      const currentTime = new Date();
      const deploymentCreateTime = deployment.metadata && deployment.metadata.creationTimestamp ? date.formatTimeDiff(new Date(deployment.metadata.creationTimestamp),currentTime) : '';
      const podContainers = deployment.spec.template.spec.containers.map((container: any) => container.name);
      const images = deployment.spec && deployment.spec.template && deployment.spec.template.spec && deployment.spec.template.spec.containers ? deployment.spec.template.spec.containers.map((container: any) => container.image) : [];
      let podStatus = '';
      if (deployment.metadata && deployment.metadata.deletionTimestamp)
        podStatus = 'Terminating';
      else
        podStatus = deployment.status && deployment.status.phase ? deployment.status.phase : '';
      const podData = {
        name: deployment.metadata && deployment.metadata.name ? deployment.metadata.name : '',
        label: labels,
        replicas: `${deployment.status.readyReplicas}/${deployment.status.replicas}`,
        image: images,
        createTime: deploymentCreateTime,
      };
      k8sDeploymentList.value!.push(podData);
    })
  } catch (error) {
    console.error('Failed to fetch pods:', error);
  }
  setLoading(false);
};

const handleViewDeployment = (record: any) => {
  router.push(`/workload/deployment/${record.name}`);
};

clusterStore.$subscribe((mutation, state) => {
  fetchDeploymentsInNamespace();
})

onMounted(() => {
  fetchDeploymentsInNamespace();
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