<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-tabs>
          <a-tab-pane key="1" >
            <template #title><icon-calendar/>概览</template>
            <a-card >
              <a-collapse :default-active-key="['1']"  >
                <a-collapse-item header="元数据" key="1" v-if="k8sPod">
                  <a-descriptions layout="inline-vertical" :column="5">
                    <a-descriptions-item :label="$t('pod.metadata.name')">{{ k8sPod.metadata.name }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('pod.metadata.namespace')">{{ k8sPod.metadata.namespace }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('pod.metadata.createtime')">{{ new Date(k8sPod.metadata.creationTimestamp).toLocaleDateString() }}</a-descriptions-item>
                    <a-descriptions-item :label="$t('pod.metadata.runtime')">{{ date.formatTimeDiff(new Date(k8sPod.metadata.creationTimestamp), currentTime) }}</a-descriptions-item>
                    <a-descriptions-item label="UID">{{ k8sPod.metadata.uid }}</a-descriptions-item>
                  </a-descriptions>
                  <a-descriptions layout="inline-vertical" :column="1">
                    <a-descriptions-item :label="$t('pod.metadata.annotations')">
                      <a-descriptions :column="1">
                        <a-descriptions-item v-for="(value, key) in k8sPod.metadata.annotations" :key="key">
                          <a-space>
                          <a-tag bordered>{{key}}:{{ value }}</a-tag>
                          <br/>
                          </a-space>
                        </a-descriptions-item>
                      </a-descriptions>
                    </a-descriptions-item>
                    <a-descriptions-item :label="$t('pod.metadata.labels')">
                      <a-descriptions :column="2">
                        <a-descriptions-item v-for="(value, key) in k8sPod.metadata.labels" :key="key">
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
import api, { K8sPod } from '@/api/cluster';
import useLoading from '@/hooks/loading';
import date from '@/utils/date';

const { t: localtext } = useI18n();

const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const router = useRouter();

const k8sPod = ref<K8sPod>();
const currentTime = new Date();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const route = useRoute();
const podname = ref();
podname.value = route.params.name;

const fetchPodDetail = async () => {
  checkStoreData();
  const clusterId = route.params.clusterId as string;
  const namespace = route.params.namespace as string;

  try {
    const result = await api.getPodDetail(clusterStore.id!, clusterStore.curNamespace!, podname.value);
    k8sPod.value = result.data;
  } catch (error) {
    console.error('Failed to fetch pod details:', error);
  }
  console.log(k8sPod.value)
};

clusterStore.$subscribe((mutation, state) => {
  router.push("/workload/podlist");
})

onMounted(() => {
  fetchPodDetail();
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