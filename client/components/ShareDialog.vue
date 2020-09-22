<template>
  <el-dialog title="地図を共有する" :visible.sync="visible" :before-close="onClose" custom-class="share-dialog">
    <!-- URL生成後 -->
    <template v-if="url">
      <el-input v-model="url">
        <el-tooltip slot="append" content="copy" placement="top">
          <el-button icon="el-icon-s-order" @click="onCopyUrl"></el-button>
        </el-tooltip>
      </el-input>
      <p class="note">※ URLの有効期限は作成から30日間です</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">閉じる</el-button>
      </span>
    </template>
    <!-- URL生成前 -->
    <template v-else>
      <el-input v-model="title" placeholder="タイトルを入力してください" maxlength="30" show-word-limit></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="isDisabledCreate" :loading="loading" @click="onCreateMapUrl"
          >作成する</el-button
        >
        <el-button @click="onClose">閉じる</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import GeoApi from '@/requests/geo-api'
import { analysisType, mapTheme } from '@/constants/view-map-state'

export default {
  props: {
    visible: {
      required: true,
      type: Boolean,
    },

    mapState: {
      required: false,
      type: Object,
      default: null,
    },

    locations: {
      required: true,
      type: Array,
    },

    cascader: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      title: '',
      url: '',
      loading: false,
    }
  },

  computed: {
    isDisabledCreate() {
      return this.title.length === 0
    },
  },

  methods: {
    onClose() {
      this.title = ''
      this.url = ''
      this.$emit('close')
    },

    async onCreateMapUrl() {
      this.loading = true
      const url = await this.postShareMapState().catch(() => {
        this.$notify.error({
          title: 'Error',
          message: 'URLの生成に失敗しました',
        })
      })
      this.url = url
      this.loading = false
    },

    async postShareMapState() {
      const type = analysisType.get(this.cascader[0]).value
      const level = this.cascader[1]
      const api = new GeoApi('/view_map_states', {
        title: this.title,
        zoom: this.mapState.zoom,
        latitude: this.mapState.center.lat(),
        longitude: this.mapState.center.lng(),
        analysis_type: type,
        analysis_level: level,
        locations: this.locations,
        map_theme: mapTheme.get(this.mapState.theme).value,
        polygon_color: this.mapState.color,
      })
      const res = await api.post()
      return `${location.origin}/viewmap/${res.data.code}`
    },

    onCopyUrl() {
      const textArea = document.createElement('textarea')
      textArea.style.cssText = 'position:absolute;left:-100%'
      document.body.appendChild(textArea)
      textArea.value = this.url
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      this.$notify({
        title: 'Success',
        message: 'クリップボードにコピーしました',
        type: 'success',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.note {
  text-align: right;
  margin-top: 6px;
  font-size: 12px;
}
</style>

<style lang="scss">
.share-dialog {
  width: 40%;

  @include sp() {
    width: 80%;
  }

  .el-input {
    @include sp() {
      font-size: 16px;
    }
  }
}
</style>
