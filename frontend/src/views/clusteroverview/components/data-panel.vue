<template>
  <a-grid :cols="24" :row-gap="16" class="panel">
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <DeployIcon />
        </div>
        <a-statistic
          extra="Deployment"
          :value="props.deploymentNum"
          :precision="0"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <DsIcon />
        </div>
        <a-statistic
          extra="DaemonSet"
          :value="props.daemonsetNum"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <StsIcon />
        </div>
        <a-statistic
          extra="StatefulSet"
          :value="props.statefulsetNum"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <PvcIcon />
        </div>
        <a-statistic
          extra="PVC"
          :value="props.pvcNum"
          :precision="0"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix> 
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
  </a-grid>
  <a-grid :cols="24" :row-gap="16" class="panel">
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <SvcIcon />
        </div>
        <a-statistic
          extra="Service"
          :value="props.serviceNum"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <IngIcon />
        </div>  
        <a-statistic
          extra="Ingress"
          :value="props.ingressNum"
          :precision="0"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix> 
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <CmIcon />
        </div>
        <a-statistic
          extra="ConfigMap"
          :value="props.configmapNum"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      class="panel-col"
      :span="{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-space>
        <div>
          <SecretIcon />
        </div>
        <a-statistic
          extra="Secret"
          :value="props.secretNum"
          :precision="0"
          :value-from="0"
          animation
        >
          <template #suffix> 
            <span class="unit">个</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
  </a-grid>
</template>

<script lang="ts" setup>

import PvcIcon from '@/assets/images/resources/pvc.svg?component';
import CmIcon from '@/assets/images/resources/cm.svg?component';
import DeployIcon from '@/assets/images/resources/deploy.svg?component';
import DsIcon from '@/assets/images/resources/ds.svg?component';
import IngIcon from '@/assets/images/resources/ing.svg?component';
import SecretIcon from '@/assets/images/resources/secret.svg?component';
import StsIcon from '@/assets/images/resources/sts.svg?component';
import SvcIcon from '@/assets/images/resources/svc.svg?component';

const props = defineProps({
  appNum: Number,
  podNum: Number,
  deploymentNum: Number,
  daemonsetNum: Number,
  statefulsetNum: Number,
  serviceNum: Number,
  ingressNum: Number,
  pvcNum: Number,
  configmapNum: Number,
  secretNum: Number,
})

</script>

<style lang="less" scoped>
  .arco-grid.panel {
    margin-bottom: 0;
    padding: 24px 20px 0 20px;
  }
  .panel-col {
    padding-left: 43px;
    border-right: 1px solid rgb(var(--gray-2));
    align: center;
    height: 120px;
  }
  .col-avatar {
    margin-right: 12px;
    background-color: var(--color-fill-2);
  }
  .up-icon {
    color: rgb(var(--red-6));
  }
  .unit {
    margin-left: 8px;
    color: rgb(var(--gray-8));
    font-size: 12px;
  }
  :deep(.panel-border) {
    margin: 4px 0 0 0;
  }
  .centered-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%; /* 可选，根据需要设置图片最大宽度 */
    max-height: 100%; /* 可选，根据需要设置图片最大高度 */
  }
</style>
