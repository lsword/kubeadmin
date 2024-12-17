<template>
  <div class="container">
    <a-breadcrumb :style="{fontSize: '14px', marginTop: '2px', marginBottom: '8px'}">
      <a-breadcrumb-item>
        <icon-list/>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-link href='/kubeadmin/appstore/storelist'>
          {{$t('storelist.breadcrumb.storelist')}}
        </a-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item v-if="store">
        <a-link :href="'/kubeadmin/appstore/storeapplist/'+storeid">
          {{store.name}}
        </a-link>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        <a-tabs >
          <a-tab-pane v-for="apptype in appTypes" :key="apptype" :title="apptype">
            <a-card :style="{ width: '100%' }">
              <template v-if="newapps(apptype).length > 0">
                <a-card-grid
                  v-for="chart in newapps(apptype)"
                  :key="chart.name"
                  :style="{ width: '25%', padding: '16px' }"
                >
                  <a-card v-if="apptype != 'all' && chart.apptype === apptype || apptype ==='all'" class="card-demo" hoverable @click="handleSelectChart(chart.name)">
                    <template #title>{{ chart.name }}</template>
                    <span :style="{ display: 'flex', alignItems: 'center'}">
                    <a-avatar v-if="chart.localicon !== undefined && chart.localicon !== ''" :imageUrl="'data:image/png;base64,'+ chart.localicon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
                    <a-avatar v-else-if="chart.icon !== undefined && chart.icon !== ''" :imageUrl="chart.icon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
                    <a-avatar v-else :imageUrl="defaultIcon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
                      <p :style="{ margin: 0 }">
                        {{$t('storeapplist.app.releases')}}：{{ chart.releases }}<br/><br/>{{$t('storeapplist.app.lastversion')}}：{{ chart.lastVersion }}
                      </p>
                    </span>
                  </a-card>
                </a-card-grid>
              </template>
              <template v-else>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <icon-empty style="font-size: 48px; margin-bottom: 10px;" />
                  <p style="margin-top: 10px;">暂无数据</p>
                </div>
              </template>
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </a-card>
      <!--
      <a-card :style="{ width: '100%' }">
        <template v-if="apps.length > 0">
          <a-card-grid
            v-for="chart in apps"
            :key="chart.name"
            :style="{ width: '25%', padding: '16px' }"
          >
            <a-card class="card-demo" hoverable @click="handleSelectChart(chart.name)">
              <template #title>{{ chart.name }}</template>
              <span :style="{ display: 'flex', alignItems: 'center'}">
              <a-avatar v-if="chart.localicon !== undefined && chart.localicon !== ''" :imageUrl="'data:image/png;base64,'+ chart.localicon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
              <a-avatar v-else-if="chart.icon !== undefined && chart.icon !== ''" :imageUrl="chart.icon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
              <a-avatar v-else :imageUrl="defaultIcon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
                <p :style="{ margin: 0 }">
                  {{$t('storeapplist.app.releases')}}：{{ chart.releases }}<br/><br/>{{$t('storeapplist.app.lastversion')}}：{{ chart.lastVersion }}
                </p>
              </span>
            </a-card>
          </a-card-grid>
        </template>
        <template v-else>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <icon-empty style="font-size: 48px; margin-bottom: 10px;" />
            <p style="margin-top: 10px;">暂无数据</p>
          </div>
        </template>
      </a-card>
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/appstore';
import { HttpResponse } from '@/api/http';
import useLoading from '@/hooks/loading';

import date from '@/utils/date';

const router = useRouter();
const { loading, setLoading } = useLoading();

const defaultIcon=ref("");
defaultIcon.value = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzA4NTkxNjM1NjE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0NjU3IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik04NTIuODEyOCAyNDUuNTgwOEw1NzkuNDU2IDk0LjEwNTZhMTQwLjk3OTIgMTQwLjk3OTIgMCAwIDAtMTM1LjM0NzIgMEwxNzEuMTg3MiAyNDYuMDE2QzEyOC43NDI0IDI2OS41NjggMTAyLjQgMzEzLjQ5NzYgMTAyLjQgMzYxLjM5NTJ2MzAwLjhhMTMxLjE3NDQgMTMxLjE3NDQgMCAwIDAgNjguNzg3MiAxMTUuMzUzNmwyNzMuMzU2OCAxNTIuMzQ1NmExNDAuOTc5MiAxNDAuOTc5MiAwIDAgMCAxMzUuMzQ3MiAwbDI3Mi45MjE2LTE1MS45MTA0QTEzMi4yMjQgMTMyLjIyNCAwIDAgMCA5MjEuNiA2NjIuMTY5NnYtMzAwLjhjMC00Ny44NzItMjYuMzY4LTkxLjgyNzItNjguNzg3Mi0xMTUuNzg4OHogbS0xMTkuNzA1NiAxOTYuNzYxNmwtMTgzLjE0MjQgMTAyLjczMjh2MTk5LjgwOGMwIDE5LjU4NC0xNi41MTIgMzYuMTQ3Mi0zNy4wNjg4IDM2LjE0NzJsLTAuNDYwOC00Ljc4NzJ2NC43ODcySDUxMmMtOS44MzA0IDAtMTguNzY0OC0zLjQ4MTYtMjUuNDcyLTEwLjQ0NDhhMzYuNDggMzYuNDggMCAwIDEtMTAuNzAwOC0yNS43MDI0di0xOTguOTEybC0xODQuOTM0NC0xMDMuNjI4OGMtMTIuOTUzNi03LjM5ODQtMjAuMDk2LTIxLjMyNDgtMTcuODY4OC0zNS42ODY0IDEuNzkyLTE0LjM2MTYgMTIuNTE4NC0yNi4xMTIgMjYuODAzMi0zMC4wMjg4IDkuMzk1Mi0yLjE3NiAxOS42NjA4LTEuMzA1NiAyOC4xNiAzLjkxNjhsMTg0LjQ0OCAxMDIuNzMyOCAxODMuMTQyNC0xMDIuNzMyOGEzOC4xNDQgMzguMTQ0IDAgMCAxIDI3LjY5OTItMy45MTY4YzkuMzY5NiAyLjE3NiAxNy40MDggOC43MDQgMjIuMzIzMiAxNi45NzI4IDEwLjc1MiAxNi45NzI4IDQuOTE1MiAzOC43MzI4LTEyLjQ5MjggNDguNzQyNHoiIGZpbGw9IiMzNEM3QkUiIHAtaWQ9IjE0NjU4Ij48L3BhdGg+PC9zdmc+"


const route = useRoute();
const storeid = ref();
storeid.value = route.params.storeid;
const store = ref();

const apps = ref<any[]>([]);

const appTypes = ref<string[]>(["all"]);

const newapps = computed(() => (apptype: string) => {
  if (apptype === "all") return apps.value;
  return apps.value.filter(app => app.apptype === apptype);
});

const handleViewAppStore = (record: any) => {
  router.push(`/appstore/storeapplist/${record.id}`);
};

const handleDelete = (record:any) => {
};

const handleSelectChart = (chartName: string) => {
  router.push(`/appstore/storeappdetail/${route.params.storeid}/${chartName}`);
};

const fetchAppStore = async () => {
  try {
    const result = await api.getAppStore(storeid.value);
    store.value = result.data;
  } catch(error) {
    console.error('Failed to fetch app store:', error);
  }
};

const fetchAppStoreApps = async () => {
  try {
    const result:HttpResponse = await api.getAppStoreAppList(storeid.value);
    if (result.code !== 0) {
      return;
    }    
    const data = result.data as Record<string, any>;
    Object.keys(data).forEach((key:string)=>{
      const appData = {
        name: key,
        releases: data[key].length,
        lastVersion: data[key][0].version,
        icon: data[key][0].icon,
        localicon: data[key][0].localicon,
        apptype: data[key][0].annotations.apptype,
        apptags: data[key][0].annotations.apptags,
      }
      if (!appTypes.value.includes(appData.apptype)) {
        appTypes.value.push(appData.apptype);
      }
      apps.value!.push(appData);
    });
    console.log(apps);
    
  } catch (error) {
    console.error('Failed to fetch app stores:', error);
  }
};

onMounted(() => {
  fetchAppStore();
  fetchAppStoreApps();
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