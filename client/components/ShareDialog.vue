<template>
  <el-dialog
    title="地図を共有"
    :visible.sync="visible"
    :before-close="onBeforeClose"
  >
    <el-input v-model="url">
      <el-tooltip slot="append" content="copy" placement="top">
        <el-button icon="el-icon-s-order"></el-button>
      </el-tooltip>
    </el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">キャンセル</el-button>
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
  },

  data() {
    return {
      url: '',
    }
  },

  methods: {
    onClose() {
      this.$emit('close')
    },

    onBeforeClose() {
      this.$emit('close')
    },
  },
}
</script>
