<template>
  <div class="container">
    <div class="layout">
      <a-card style="height: auto;"  id="container">
      <h1>deploymentlist</h1>
      </a-card>
    </div>
  </div>
</template>

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