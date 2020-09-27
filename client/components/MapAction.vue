<template>
  <div class="map-action">
    <Cascader :cascader="cascader" class="cascader" @change="onChangeCascader" />
    <el-button class="share-button" icon="el-icon-share" @click="onClickShare">地図を共有する</el-button>
    <el-button v-if="data.length > 0" class="table-button" icon="el-icon-data-analysis" @click="onClickTable"
      >表・グラフで確認する</el-button
    >
  </div>
</template>

<script>
export default {
  props: {
    cascader: {
      required: true,
      type: Array,
    },

    data: {
      required: true,
      type: Array,
    },
  },

  methods: {
    onChangeCascader(value) {
      this.$emit('changeCascader', value)
    },

    onClickShare() {
      this.$emit('clickShare')
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
  .share-button,
  .table-button {
    margin: 5px;
  }

  .cascader {
    /deep/ .el-input {
      @include xs() {
        font-size: 16px;
      }
    }
  }

  .share-button,
  .table-button {
    /deep/ span {
      @include xs() {
        display: none;
      }
    }
  }
}
</style>
