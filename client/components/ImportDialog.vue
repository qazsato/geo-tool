<template>
  <el-dialog title="緯度経度データ読み込み" :visible.sync="visible" :before-close="onBeforeClose">
    <el-input
      v-model="textarea"
      type="textarea"
      :placeholder="placeholder"
      :autosize="{ minRows: 10, maxRows: 10 }"
    ></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClickSample">お試し</el-button>
      <div class="spacer"></div>
      <el-button type="primary" :disabled="isDisabledImport" @click="onImport">読み込み</el-button>
      <el-button @click="onClose">キャンセル</el-button>
    </span>
  </el-dialog>
</template>

<script>
import japanmesh from 'japanmesh'

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
      this.textarea = ''
      const locations = this.getRandomLocations()
      locations.forEach((l) => {
        if (this.textarea.length !== 0) {
          this.textarea += '\n'
        }
        this.textarea += `${l.lat},${l.lng}`
      })
    },

    getRandomLocations() {
      const LIMIT = 100
      const TARGET_MESH_CODE = '5339' // 東京近郊
      const locations = []
      const lv2codes = japanmesh.getCodes(TARGET_MESH_CODE)
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
      while (locations.length < LIMIT) {
        const lv3codes = japanmesh.getCodes(lv2codes[rand(0, lv2codes.length - 1)])
        const geojson = japanmesh.toGeoJSON(lv3codes[rand(0, lv3codes.length - 1)])
        const coordinate = geojson.geometry.coordinates[0][rand(0, 4)]
        const code = japanmesh.toCode(coordinate[1], coordinate[0], rand(5, 6))
        if (code.indexOf(TARGET_MESH_CODE) === 0) {
          const g = japanmesh.toGeoJSON(code)
          const c = g.geometry.coordinates[0][rand(0, 4)]
          locations.push({ lat: c[1], lng: c[0] })
        }
      }
      return locations
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;

  .spacer {
    flex: 1;
  }
}
</style>
