<template>
  <el-dialog
    title="緯度経度データ読み込み"
    :visible.sync="visible"
    :before-close="onBeforeClose"
  >
    <el-input
      v-model="textarea"
      type="textarea"
      :placeholder="placeholder"
      :autosize="{ minRows: 10, maxRows: 10 }"
    ></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClickSample">お試し</el-button>
      <div class="spacer"></div>
      <el-button type="primary" :disabled="isDisabledImport" @click="onImport"
        >読み込み</el-button
      >
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
      textarea: '',
      placeholder: 'latitude,longitude',
    }
  },

  computed: {
    isDisabledImport() {
      return this.textarea.length === 0
    },

    locations() {
      const locations = []
      const rows = this.textarea.split('\n')
      rows.forEach((row) => {
        const lat = Number(row.split(',')[0])
        const lng = Number(row.split(',')[1])
        if (!lat || !lng) return
        locations.push({ lat, lng })
      })
      return locations
    },
  },

  methods: {
    isValidText() {
      let isValid = true
      const rows = this.textarea.split('\n')
      rows.forEach((row) => {
        const lat = Number(row.split(',')[0])
        const lng = Number(row.split(',')[1])
        if (!lat || !lng) {
          isValid = false
        }
      })
      return isValid
    },

    onImport() {
      if (!this.isValidText()) {
        this.$notify.error({
          title: 'Error',
          message: '不正なデータが含まれています',
        })
        return
      }
      this.$emit('import', this.locations)
      this.$emit('close')
    },

    onClose() {
      this.$emit('close')
    },

    onBeforeClose() {
      this.$emit('close')
    },

    onClickSample() {
      this.textarea = `35.63908141220088,139.47267708300782\n35.708527085483155,139.54580482958985\n35.65386808298502,139.58803352832032`
    },
  },
}
</script>

<style lang="scss" scoped>
.el-dialog {
  width: 50%;
}

.dialog-footer {
  display: flex;

  .spacer {
    flex: 1;
  }
}
</style>
