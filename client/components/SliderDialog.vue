<template>
  <el-dialog title="件数で絞り込む" :visible.sync="visible" :before-close="onClose" custom-class="slider-dialog">
    <div class="slider-area">
      <div>{{ min }}</div>
      <el-slider v-model="innerValue" range :min="min" :max="max"></el-slider>
      <div>{{ max }}</div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onApply">適用する</el-button>
      <el-button @click="onClose">閉じる</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      required: true,
      type: Boolean,
    },

    min: {
      required: false,
      type: Number,
      default: null,
    },

    max: {
      required: false,
      type: Number,
      default: null,
    },

    value: {
      required: false,
      type: Array,
      default: null,
    },
  },

  data() {
    return {
      innerValue: this.value,
    }
  },

  watch: {
    value(val) {
      this.innerValue = val
    },
  },

  methods: {
    onApply() {
      this.$emit('apply', this.innerValue)
    },

    onClose() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.slider-area {
  display: flex;
  align-items: center;

  .el-slider {
    flex: 1;
    margin: 0 16px;
  }
}
</style>

<style lang="scss">
.slider-dialog {
  width: 40%;

  @include xs() {
    width: 80%;
  }

  .el-input {
    @include xs() {
      font-size: 16px;
    }
  }
}
</style>
