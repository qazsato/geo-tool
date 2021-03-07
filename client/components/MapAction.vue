<template>
  <div class="map-action">
    <Cascader :cascader="cascader" class="cascader" @change="onChangeCascader" />
    <template v-if="data.length > 0">
      <el-button class="slider-button" icon="el-icon-s-operation" @click="onClickSlider">件数で絞り込む</el-button>
      <el-button class="table-button" icon="el-icon-pie-chart" @click="onClickTable">表・グラフで確認する</el-button>
    </template>
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

    onClickSlider() {
      this.$emit('clickSlider')
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
  .slider-button,
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

  .slider-button,
  .table-button {
    /deep/ span {
      @include xs() {
        display: none;
      }
    }
  }
}
</style>
