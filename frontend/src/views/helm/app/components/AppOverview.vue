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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import useLoading from '@/hooks/loading';
import api, { Cluster, K8sPod, HttpResponse, getHelmApp } from '@/api/cluster';

const { loading, setLoading } = useLoading(true);

const helmApp = ref();

const props = defineProps({
  clusterId: String,
  nameSpace: String,
  appName: String,
})

const ingressData = ref<any>([]);
const secretData = ref<any>([]);

const decodedBase64 = (encodedData: any) => {
  if (encodedData) {
    // 使用Base64解码
    return atob(encodedData);
  }
  return '';
};


const fetchHelmApp = async () => {
  try {
    const result: HttpResponse = await getHelmApp(props.appName!, props.clusterId!, props.nameSpace!);
    console.log(result.msg);
    // const currentTime = new Date();
    // const podCreateTime = pod.metadata && pod.metadata.creationTimestamp ? date.formatTimeDiff(new Date(pod.metadata.creationTimestamp),currentTime) : '';
    helmApp.value = result.data;
    result.data.forEach(
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

      })
  } catch (error) {
    console.error('Failed to fetch Helm releases:', error);
  } finally {
    setLoading(false);
  }
};

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
</style>
