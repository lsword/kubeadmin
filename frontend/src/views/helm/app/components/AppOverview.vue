<template>
  <div class="container">
    <a-row :gutter="20" :style="{ marginBottom: '20px' }">
      <a-col :span="12">
        <a-card
          title="Web访问地址"
          :style="{ width: '100%', marginTop: '20px' }"
          :loading="loading"
        >
        <a-list :split="false">
            <a-list-item v-for="(ingress, index) in ingressData" :key="index">
              <a-link :href="'http://' + ingress.rule" target="_blank">{{ingress.rule}}</a-link>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card
          title="保密字典"
          :style="{ width: '100%', marginTop: '20px' }"
          :loading="loading"
        >
          <div>
            <!-- 遍历 secretData 中的所有键值对 -->
            <div v-for="(secret, index) in secretData" :key="index">
              <a-collapse :default-active-key="['1']">
                <a-collapse-item
                  v-for="(value, key) in secret.data"
                  :key="key"
                  :header="String(key)"
                >
                  <div style="white-space: normal; word-break: break-all">
                    {{ decodedBase64(value) }}
                  </div>
                </a-collapse-item>
              </a-collapse>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <a-card title="服务" :style="{ width: '100%', marginBottom: '20px' }">
      <a-table :data="serviceData" :loading="loading">
        <template #columns>
          <a-table-column :title="$t('app.table.service.name')" data-index="metadata.name">
          </a-table-column>
          <a-table-column :title="$t('app.table.service.type')" data-index="spec.type">
          </a-table-column>
          <a-table-column :title="$t('app.table.service.portname')">
            <template #cell="{ record }">
              <span v-for="(port, index) in record.spec.ports" :key="index">
                {{ port.name }}
                <br v-if="index < record.spec.ports.length - 1" />
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="$t('app.table.service.portprotocol')">
            <template #cell="{ record }">
              <span v-for="(port, index) in record.spec.ports" :key="index">
                {{ port.protocol }}
                <br v-if="index < record.spec.ports.length - 1" />
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="$t('app.table.service.port')">
            <template #cell="{ record }">
              <span v-for="(port, index) in record.spec.ports" :key="index">
                {{ port.port }}
                <br v-if="index < record.spec.ports.length - 1" />
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="$t('app.table.service.internaladdress')">
            <template #cell="{ record }">
              <span v-for="(port, index) in record.spec.ports" :key="index">
                {{ record.metadata.name }}.{{ clusterStore.curNamespace }}:{{ port.port }}
                <br v-if="index < record.spec.ports.length - 1" />
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="$t('app.table.service.externaladdress')">
            <template #cell="{ record }">
              <div class="switch">
              <a-switch :model-value="record.spec.type!=='ClusterIP'" @change="handleExternalServiceSwitchChange(record)">
                <template #checked>
                  打开
                </template>
                <template #unchecked>
                  关闭
                </template>
              </a-switch>
              <div v-if="record.spec.type !== 'ClusterIP'" class="ip-container">
                <div v-for="(port, index) in record.spec.ports" :key="index" class="external-ip">
                  {{ externalAddr }}:{{ port.nodePort }}
                  <br v-if="index < record.spec.ports.length - 1" />
                </div>
              </div>
            </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import useLoading from '@/hooks/loading';
import { postServiceType, getHelmApp } from '@/api/cluster';
import type { HttpResponse } from '@/api/http';
import { useClusterStore } from '@/store';

const router = useRouter();

const clusterStore = useClusterStore();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const { loading, setLoading } = useLoading(true);

const test = ref(true);

const helmApp = ref();

const props = defineProps({
  clusterId: String,
  nameSpace: String,
  appName: String,
})

const ingressData = ref<any>([]);
const secretData = ref<any>([]);
const serviceData = ref<any>([]);

const externalAddr = computed(() => {
  try {
    const parsedUrl = new URL(clusterStore.address!);
    return parsedUrl.hostname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return "";
  }
});

const decodedBase64 = (encodedData: any) => {
  if (encodedData) {
    // 使用Base64解码
    return atob(encodedData);
  }
  return '';
};

const fetchHelmApp = async () => {
  checkStoreData();
  try {
    const result: HttpResponse = await getHelmApp(props.appName!, props.clusterId!, props.nameSpace!);
    console.log(result.msg);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    helmApp.value = result.data;
    (result.data as any[]).forEach(
      (item: {
        [x: string]: any;
        kind: string;
        metadata: { [x: string]: any; };
        spec: {
          [x: string]: any;
          type: any;
          ports: any;
        };
      } )=>{
        if (item.kind === 'Ingress') {
          item.spec.rules.forEach((rule: any)=>{
            console.log(rule.host);
            ingressData.value.push({ rule: rule.host });
          })
        }
        if (item.kind === 'Secret') {
          secretData.value.push({ data: item.data });
        }
        if (item.kind === 'Service') {
          console.log(item);
          serviceData.value.push(item);
        }

      })
  } catch (error) {
    console.error('Failed to fetch Helm releases:', error);
  } finally {
    setLoading(false);
  }
};

const handleExternalServiceSwitchChange = async(service: any) => {
  try {
    setLoading(true);
    await postServiceType(
      clusterStore.id,
      clusterStore.curNamespace,
      service.metadata.name,
      service.spec.type === 'NodePort' ? 'ClusterIP': 'NodePort',
    );
    ingressData.value = [];
    secretData.value = [];
    serviceData.value = [];
    await fetchHelmApp();
  } catch (e) {
    console.log(e);
  } finally {
    setLoading(false);
  }
}

clusterStore.$subscribe((mutation, state) => {
  fetchHelmApp();
})

onMounted(() => {
  fetchHelmApp();
});


</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 24px;
  margin-bottom: 4px;
  .item-content {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
    color: var(--color-text-2);
    text-decoration: none;
    font-size: 13px;
    cursor: pointer;
  }
}

.switch-container {
  display: flex;
  align-items: center; /* 垂直居中 */
}

.ip-container {
  margin-right: 10px; /* 可根据需要调整间距 */
}

.external-ip {
  display: block;
}

.switch {
  display: flex;
  align-items: center; /* 垂直居中 */
}

</style>
