<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
        xxx
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