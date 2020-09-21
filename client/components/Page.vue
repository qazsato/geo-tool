<template>
  <el-container class="page">
    <el-header>
      <slot name="header"></slot>
    </el-header>
    <el-main>
      <slot></slot>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}

.el-header {
  padding: 0;
}

.el-main {
  position: relative;
  padding: 0;
  height: 100%;
}
</style>
