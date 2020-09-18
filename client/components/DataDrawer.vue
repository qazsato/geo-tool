<template>
  <el-drawer
    :title="title"
    :visible.sync="innerVisible"
    :before-close="onBeforeClose"
    custom-class="data-drawer"
    direction="ltr"
  >
    <el-tabs v-model="activeTab" :stretch="true">
      <el-tab-pane label="表" name="table">
        <el-table :data="data" :default-sort="{ prop: 'count', order: 'descending' }">
          <el-table-column prop="key" label="名前" sortable></el-table-column>
          <el-table-column prop="count" label="件数" width="100" sortable></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="グラフ" name="graph">
        <canvas ref="chart"></canvas>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
export default {
  props: {
    title: {
      required: true,
      type: String,
    },

    visible: {
      required: true,
      type: Boolean,
    },

    data: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      activeTab: 'table',
      innerVisible: this.visible,
    }
  },

  watch: {
    visible(val) {
      console.log('visible', val)
      this.innerVisible = val
    },
  },

  methods: {
    onBeforeClose() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 100%;
}
</style>

<style lang="scss">
.data-drawer {
  width: 40% !important;
  outline: 0;

  @include bp_sp() {
    width: 100% !important;
  }

  .el-drawer__header {
    > span {
      outline: 0;
    }
  }

  .el-drawer__body {
    overflow: auto;
  }
}
</style>
