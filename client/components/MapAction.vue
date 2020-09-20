<template>
  <div class="map-action">
    <Cascader class="cascader" @change="onChangeCascader" />
    <!-- <el-button icon="el-icon-share" @click="onClickShare">地図を共有する</el-button> -->
    <el-button v-if="data.length > 0" class="table-button" icon="el-icon-data-analysis" @click="onClickTable"
      >表・グラフで確認する</el-button
    >
  </div>
</template>

<script>
export default {
  props: {
    data: {
      required: true,
      type: Array,
    },
  },

  methods: {
    onChangeCascader(value) {
      this.$emit('changeCascader', value)
    },

    onClickTable() {
      this.$emit('clickTable')
    },
  },
}
</script>

<style lang="scss" scoped>
.map-action {
  display: flex;
  flex-wrap: wrap;

  .cascader,
  .table-button {
    margin: 5px;
  }

  .table-button {
    /deep/ span {
      @include sp() {
        display: none;
      }
    }
  }
}
</style>
