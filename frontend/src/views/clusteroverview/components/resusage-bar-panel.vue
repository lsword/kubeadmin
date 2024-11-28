<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{
        padding: '20px',
      }"
    >
      <Chart height="310px" :option="chartOption" />
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import useChartOption from '@/hooks/chart-option';
  import {ref, toRefs, watch} from 'vue';

  const props = defineProps({
    appData: Array,
    podData: Array,
    title: String,
    resType: String,
  })

  const { loading } = useLoading();

  const xData = ref<any>([]);
  const yData = ref<any>([]);
  const { podData } = toRefs(props);

  podData?.value?.forEach((data: any)=>{
    xData.value.push(data.value);
    yData.value.push(data.name);
  })

  watch(()=>props.podData, (newValue, oldValue) => {
    xData.value = [];
    yData.value = [];
    newValue.forEach((data:any) => {
      xData.value.push(data.value);
      yData.value.push(data.name);
    })
  });

  const { chartOption } = useChartOption((isDark) => {
    return {
      grid: {
        left: 200,
        right: 20,
        top: 0,
        bottom: 20,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          show: true,
          formatter(value: number, idx: number) {
            if (idx === 0) return String(value);
            return `${Number(value)}k`;
          },
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#484849' : '#E5E8EF',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: yData.value,
        axisLabel: {
          show: true,
          color: '#4E5969',
        },
        axisTick: {
          show: true,
          length: 2,
          lineStyle: {
            color: '#A9AEB8',
          },
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#484849' : '#A9AEB8',
          },
        },
      },
      tooltip: {
        show: true,
        trigger: 'axis',
      },
      series: [
        {
          // data: [1033, 1244, 1520],
          data: xData.value,
          type: 'bar',
          barWidth: 7,
          itemStyle: {
            color: '#4086FF',
            borderRadius: 4,
          },
        },
      ],
    };
    /*
    return {
      grid: {
        left: 44,
        right: 20,
        top: 0,
        bottom: 20,
      },
      xAxis: {
        // type: 'value',
        type: 'category',
        axisLabel: {
          show: true,
          formatter(value: number, idx: number) {
            if (idx === 0) return String(value);
            return `${Number(value) / 1000}k`;
          },
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#484849' : '#E5E8EF',
          },
        },
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          show: true,
          color: '#4E5969',
        },
        axisTick: {
          show: true,
          length: 2,
          lineStyle: {
            color: '#A9AEB8',
          },
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#484849' : '#A9AEB8',
          },
        },
      },
      tooltip: {
        show: true,
        trigger: 'axis',
      },
      dataset: [
        {
          dimensions: ['value', 'name'],
          // source: props.podData,
          source: [
            ['123', 'aaa'],
            ['123', 'aaa'],
          ]
        }
      ],
      series: [
        {
          // data: [1033, 1244, 1520],
          datasetIndex: 1,
          encode: { x: 'value', y: 'name' },
          type: 'bar',
          barWidth: 7,
          itemStyle: {
            color: '#4086FF',
            borderRadius: 4,
          },
        },
      ],
    };
    */
  });
</script>

<style scoped lang="less"></style>
