<template>
  <el-container class="page">
    <el-header>
      <Header />
    </el-header>
    <el-main>
      <Cascader class="cascader" />
      <GoogleMap />
    </el-main>
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  async mounted() {
    await this.loadMap()
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),
  },
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
}

.el-main {
  position: relative;
  padding: 0;
}

.cascader {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
</style>
