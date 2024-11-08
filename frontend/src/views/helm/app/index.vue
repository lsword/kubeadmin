<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-link href='/helm/applist'>
          {{$t('applist.breadcrumb.applist')}}
        </a-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item v-if="appName">
        <a-link :href="'/helm/app/'+appName">
          {{appName}}
        </a-link>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-tabs >
          <a-tab-pane key="1" v-if="appName" :loading="loading" class="tab-content-container">
            <template #title><icon-calendar/>概览</template>
            <AppOverview :clusterId="clusterStore.id" :nameSpace="clusterStore.curNamespace" :appName="appName" />
          </a-tab-pane>
          <a-tab-pane key="4" :loading="loading">
            <template #title>
              <icon-settings/> 变更
            </template>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import api, { Cluster, K8sPod, getHelmApp } from '@/api/cluster';
import { HttpResponse } from '@/api/http';
import useLoading from '@/hooks/loading';
import date from '@/utils/date';
import AppOverview from "./components/AppOverview.vue";

const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const router = useRouter();

const route = useRoute();

const appName = ref();
appName.value = route.params.name;

const helmApp = ref();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const fetchHelmApp = async () => {
  checkStoreData();
  try {
    const result: HttpResponse = await getHelmApp(appName.value, clusterStore.id!, clusterStore.curNamespace!);
    console.log(result.msg);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    helmApp.value = result.data;
  } catch (error) {
    console.error('Failed to fetch Helm releases:', error);
  }
};

onMounted(() => {
  checkStoreData();
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