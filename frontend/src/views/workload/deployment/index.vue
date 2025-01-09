<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        {{ $t('deployment.breadcrumb.workload') }}
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-link href='/kubeadmin/workload/deploymentlist'>
          Deployments
        </a-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        {{ deploymentname }}
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-tabs>
          <a-tab-pane key="1" >
            <template #title><icon-calendar/>概览</template>
            <a-card >
              <a-collapse :default-active-key="['1']"  >
                <a-collapse-item header="元数据" key="1" v-if="k8sDeployment">
                  <a-descriptions layout="inline-vertical" :column="5">
                    <a-descriptions-item :label="$t('deployment.metadata.name')">{{ k8sDeployment.metadata.name }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('deployment.metadata.namespace')">{{ k8sDeployment.metadata.namespace }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('deployment.metadata.createtime')">{{ new Date(k8sDeployment.metadata.creationTimestamp).toLocaleDateString() }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('deployment.metadata.runtime')">{{ date.formatTimeDiff(new Date(k8sDeployment.metadata.creationTimestamp), currentTime) }}</a-descriptions-item>
                    <a-descriptions-item label="UID">{{ k8sDeployment.metadata.uid }}</a-descriptions-item>
                  </a-descriptions>
                  <a-descriptions layout="inline-vertical" :column="1">
                    <a-descriptions-item :label="$t('deployment.metadata.annotations')">
                      <a-descriptions :column="1">
                        <a-descriptions-item v-for="(value, key) in k8sDeployment.metadata.annotations" :key="key">
                          <a-space>
                          <a-tag bordered>{{key}}:{{ value }}</a-tag>
                          <br/>
                          </a-space>
                        </a-descriptions-item>
                      </a-descriptions>
                    </a-descriptions-item>
                    <a-descriptions-item :label="$t('deployment.metadata.labels')">
                      <a-descriptions :column="2">
                        <a-descriptions-item v-for="(value, key) in k8sDeployment.metadata.labels" :key="key">
                          <a-space>
                          <a-tag bordered>{{key}}:{{ value }}</a-tag>
                          <br/>
                          </a-space>
                        </a-descriptions-item>
                      </a-descriptions>
                    </a-descriptions-item>
                  </a-descriptions>

                </a-collapse-item>
              </a-collapse>
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import api from '@/api/cluster';
import useLoading from '@/hooks/loading';
import date from '@/utils/date';

const { t: localtext } = useI18n();

const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const router = useRouter();

const k8sDeployment = ref<any>();
const currentTime = new Date();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const route = useRoute();
const deploymentname = ref();
deploymentname.value = route.params.name;

const fetchDeploymentDetail = async () => {
  checkStoreData();

  try {
    const result = await api.getDeploymentDetail(clusterStore.id!, clusterStore.curNamespace!, deploymentname.value);
    k8sDeployment.value = result.data;
  } catch (error) {
    console.error('Failed to fetch deployment details:', error);
  }
  console.log(k8sDeployment.value)
};

clusterStore.$subscribe((mutation, state) => {
  router.push("/workload/deploymentlist");
})

onMounted(() => {
  fetchDeploymentDetail();
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