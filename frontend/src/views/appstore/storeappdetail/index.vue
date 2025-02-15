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
      <a-breadcrumb-item>
        <a-link :href="'/kubeadmin/appstore/storeappdetail/' + storeid + '/' + chartname">
          {{chartname}}
        </a-link>
      </a-breadcrumb-item>
    </a-breadcrumb>

    <div class="layout">
      <a-card :style="{ width: '100%' }">
        <a-space>
          <a-avatar v-if="appLocalIcon !== ''" :imageUrl="'data:image/png;base64,'+ appLocalIcon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"/>
          <a-avatar v-else-if="appIcon !== undefined && appIcon !== ''" :imageUrl="appIcon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }"></a-avatar>
          <a-avatar v-else :imageUrl="defaultIcon" :size="64" shape="square" :style="{ marginRight: '8px', backgroundColor: '#FFFFFF' }" />
          <a-space direction="vertical">
            <a-typography-title :heading="5" style="margin-top: 0" v-if="chartname">
              {{ chartname }}
            </a-typography-title>
            <a-space>
              {{ $t('storeappdetail.app.version') }}：
              <a-select
                v-model="curVersion"
                :style="{ width: '200px' }"
              >
                <a-option v-for="(value,index) in appVersions" :key="index">{{value.version}}</a-option>
              </a-select>
              <a-button type="primary" @click="handleInstall">{{ $t('storeappdetail.app.install') }}</a-button>
            </a-space>
          </a-space>
        </a-space>
      </a-card>
      <a-card :loading="loading">
        <a-tabs >
          <a-tab-pane key="readme">
            <template #title><icon-book/>{{ $t('storeappdetail.app.readme') }}</template>
            <a-card >
              <MarkDown :markdownData="readme"/>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="parameters">
            <template #title><icon-unordered-list/>{{ $t('storeappdetail.app.values') }}</template>
            <a-card  >
              <ConfigEditor
                theme="vs-light"
                :originalConf="appDefaultValues"
                :currentConf="appInstallValues"
                :diffEditor="true"
                :height="520"
                @valueChanged="onValueChanged"
              />
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </a-card>
      <a-modal v-model:visible="installModalVisible" @ok="handleInstallOk" @cancel="handleInstallCancel">
      <template #title>
        {{ $t('storeappdetail.deploy.title') }}
      </template>
      <a-form :model="installForm" >
        <a-form-item :label="$t('storeappdetail.deploy.appname')">
          <a-input
            v-model="installForm.name"
          />
        </a-form-item>
        <a-form-item :label="$t('storeappdetail.deploy.appnamespace')">
          <a-select
            v-model="installForm.namespace"
            :style="{ width: '200px' }"
            allow-search
          >
            <a-option v-for="(value, index) in clusterStore.namespaces" :key="index">
              {{ value }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message,Modal } from '@arco-design/web-vue';
import { useClusterStore } from '@/store';
import { postHelmAppInstall } from '@/api/cluster';
import appStoreApi from '@/api/appstore';
import { HttpResponse } from '@/api/http';
import ConfigEditor from '@/components/configeditor/index.vue';
import MarkDown from '@/components/markdown/index.vue'
import useLoading from '@/hooks/loading';

const { loading, setLoading } = useLoading(true);

const clusterStore = useClusterStore();

const route = useRoute();
const storeid = ref();
storeid.value = route.params.storeid;
const chartname = ref();
chartname.value = route.params.chartname;
storeid.value = route.params.storeid;
const store = ref();
const appInfo = ref();
const appVersions = ref<any>([]);
const appDefaultValues = ref("");
const appInstallValues = ref("");
const appLocalIcon = ref("");
const appIcon = ref("");
const readme = ref("");
const curVersion = ref("");
const installModalVisible = ref(false);

const installForm = reactive({
  name: '',
  namespace: '',
})

const defaultIcon=ref("");
defaultIcon.value = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzA4NTkxNjM1NjE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0NjU3IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik04NTIuODEyOCAyNDUuNTgwOEw1NzkuNDU2IDk0LjEwNTZhMTQwLjk3OTIgMTQwLjk3OTIgMCAwIDAtMTM1LjM0NzIgMEwxNzEuMTg3MiAyNDYuMDE2QzEyOC43NDI0IDI2OS41NjggMTAyLjQgMzEzLjQ5NzYgMTAyLjQgMzYxLjM5NTJ2MzAwLjhhMTMxLjE3NDQgMTMxLjE3NDQgMCAwIDAgNjguNzg3MiAxMTUuMzUzNmwyNzMuMzU2OCAxNTIuMzQ1NmExNDAuOTc5MiAxNDAuOTc5MiAwIDAgMCAxMzUuMzQ3MiAwbDI3Mi45MjE2LTE1MS45MTA0QTEzMi4yMjQgMTMyLjIyNCAwIDAgMCA5MjEuNiA2NjIuMTY5NnYtMzAwLjhjMC00Ny44NzItMjYuMzY4LTkxLjgyNzItNjguNzg3Mi0xMTUuNzg4OHogbS0xMTkuNzA1NiAxOTYuNzYxNmwtMTgzLjE0MjQgMTAyLjczMjh2MTk5LjgwOGMwIDE5LjU4NC0xNi41MTIgMzYuMTQ3Mi0zNy4wNjg4IDM2LjE0NzJsLTAuNDYwOC00Ljc4NzJ2NC43ODcySDUxMmMtOS44MzA0IDAtMTguNzY0OC0zLjQ4MTYtMjUuNDcyLTEwLjQ0NDhhMzYuNDggMzYuNDggMCAwIDEtMTAuNzAwOC0yNS43MDI0di0xOTguOTEybC0xODQuOTM0NC0xMDMuNjI4OGMtMTIuOTUzNi03LjM5ODQtMjAuMDk2LTIxLjMyNDgtMTcuODY4OC0zNS42ODY0IDEuNzkyLTE0LjM2MTYgMTIuNTE4NC0yNi4xMTIgMjYuODAzMi0zMC4wMjg4IDkuMzk1Mi0yLjE3NiAxOS42NjA4LTEuMzA1NiAyOC4xNiAzLjkxNjhsMTg0LjQ0OCAxMDIuNzMyOCAxODMuMTQyNC0xMDIuNzMyOGEzOC4xNDQgMzguMTQ0IDAgMCAxIDI3LjY5OTItMy45MTY4YzkuMzY5NiAyLjE3NiAxNy40MDggOC43MDQgMjIuMzIzMiAxNi45NzI4IDEwLjc1MiAxNi45NzI4IDQuOTE1MiAzOC43MzI4LTEyLjQ5MjggNDguNzQyNHoiIGZpbGw9IiMzNEM3QkUiIHAtaWQ9IjE0NjU4Ij48L3BhdGg+PC9zdmc+"

const handleInstall = () => {
  installModalVisible.value = true;
}

const handleInstallOk = async () => {
  installModalVisible.value = false;
  
  // todo: check install argument
  // todo: i18n
  // appname: string, chartname: string, chartversion: string, chartrepo: string, namespace: string, values: string
  const installResult:HttpResponse = await postHelmAppInstall(installForm.name, chartname.value, curVersion.value, storeid.value, clusterStore.id!, installForm.namespace, appInstallValues.value);
  console.log(installResult);
  if (installResult.code === 20000) {
    Message.success("安装成功！")
  } else {
    Modal.error({
      title: '安装失败',
      content:
      `${installResult.msg}`,
      maskClosable: false,
    });
  }
}

const handleInstallCancel = () => {
  installModalVisible.value = false;
}

const onValueChanged = (value:string) => {
  appInstallValues.value = value;
}

const fetchAppStore = async () => {
  try {
    setLoading(true);
    const result = await appStoreApi.getAppStore(storeid.value);
    store.value = result.data;
  } catch(error) {
    console.error('Failed to fetch app store:', error);
  } finally {
    setLoading(false);
  }
};

const fetchAppVersions = async () => {
  try {
    setLoading(true);
    const result = await appStoreApi.getAppStoreAppVersions(storeid.value, chartname.value);
    if (Array.isArray(result.data) && result.data.length > 0) {
      appVersions.value = result.data;
      curVersion.value = appVersions.value[0]?.version || '';
    } else {
      console.error('No app versions found');
    }
  } catch(error) {
    console.error('Failed to fetch app store:', error);
  } finally {
    setLoading(false);
  }
}

const fetchAppInfo = async () => {
  try {
    setLoading(true);
    if (curVersion.value==='') return;
    const result = await appStoreApi.getAppStoreAppInfo(storeid.value, chartname.value, curVersion.value);
    appInfo.value = result.data;
    appDefaultValues.value = appInfo.value.values;
    appInstallValues.value = appInfo.value.values;
    readme.value = appInfo.value.readme;
    appLocalIcon.value = appInfo.value.localicon;
    appIcon.value = appInfo.value.icon;
  } catch(error) {
    console.error('Failed to fetch app info:', error);
  } finally {
    setLoading(false);
  }
};

watch(curVersion, () => {
  fetchAppInfo();
});

onMounted(() => {
  fetchAppStore();
  fetchAppVersions();
  fetchAppInfo();
  installForm.namespace = clusterStore.curNamespace!;
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
