<template>
  <el-dialog
    title="緯度経度データ読み込み"
    :visible.sync="visible"
    :before-close="onBeforeClose"
    custom-class="import-dialog"
    :close-on-click-modal="false"
  >
    <el-input
      v-model="textarea"
      type="textarea"
      :placeholder="placeholder"
      :autosize="{ minRows: 10, maxRows: 10 }"
    ></el-input>
    <span slot="footer" class="dialog-footer">
      <div class="help-area">
        <el-tooltip content="ランダムで生成した緯度経度を設定します" placement="top">
          <el-button @click="onClickSample">お試し</el-button>
        </el-tooltip>

        <el-popover placement="top" title="緯度経度の形式について" width="300" trigger="hover">
          <ul class="popover-list">
            <li>一行毎にカンマ区切りで緯度,経度の形式で入力してください。</li>
            <li>指定できる最大件数は {{ MAX_COUNT.toLocaleString() }} です。</li>
            <li>測地系は世界測地系 (WGS84) です。</li>
          </ul>
          <i slot="reference" class="about-icon el-icon-info"></i>
        </el-popover>
      </div>
      <div class="spacer"></div>
      <div>
        <el-button type="primary" :disabled="isDisabledImport" @click="onImport">読み込み</el-button>
        <el-button @click="onClose">キャンセル</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { japanmesh } from 'japanmesh'
import { ANALYTICS_LIMIT } from '@/constants/address'

export default {
  props: {
    visible: {
      required: true,
      type: Boolean,
    },
  },

  data() {
    return {
      MAX_COUNT: ANALYTICS_LIMIT,
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
    getInvalidRowNumbers() {
      const rowNumbers = []
      const rows = this.textarea.split('\n')
      rows.forEach((row, index) => {
        const lat = Number(row.split(',')[0])
        const lng = Number(row.split(',')[1])
        if (!lat || !lng) {
          rowNumbers.push(index + 1)
        }
      })
      return rowNumbers
    },

    onImport() {
      if (this.locations.length > this.MAX_COUNT) {
        this.$notify.error({
          title: 'Error',
          message: `解析できるデータは最大${this.MAX_COUNT.toLocaleString()}件です`,
        })
        return
      }
      const invalidRowNumbers = this.getInvalidRowNumbers()
      if (invalidRowNumbers.length > 0) {
        this.$notify.error({
          title: 'Error',
          message: `${invalidRowNumbers.toString()}行目が不正なデータです`,
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
      const LIMIT = 1000
      const TARGET_MESH_CODE = '5339' // 東京近郊
      const locations = []
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
      while (locations.length < LIMIT) {
        const lv1000codes = japanmesh.getCodes(TARGET_MESH_CODE, 1000)
        const geojson = japanmesh.toGeoJSON(lv1000codes[rand(0, lv1000codes.length - 1)])
        const coordinate = geojson.geometry.coordinates[0][rand(0, 4)]
        const code = japanmesh.toCode(coordinate[1], coordinate[0], 125)
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
.el-textarea {
  @include xs() {
    font-size: 16px;
  }
}

.dialog-footer {
  display: flex;

  @include xs() {
    flex-direction: column;
    align-items: center;
  }

  .spacer {
    flex: 1;
    margin-bottom: 20px;
  }
}

.help-area {
  display: flex;
  align-items: center;

  .about-icon {
    padding: 5px;
    margin-left: 10px;
    font-size: 20px;
    color: #666;
  }
}

.popover-list {
  padding-left: 20px;
  padding-bottom: 10px;
}
</style>

<style lang="scss">
.import-dialog {
  width: 40%;

  @include md() {
    width: 80%;
  }
}
</style>
