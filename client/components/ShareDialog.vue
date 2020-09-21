<template>
  <el-dialog title="地図を共有する" :visible.sync="visible" :before-close="onClose" custom-class="share-dialog">
    <template v-if="url">
      <el-input v-model="url">
        <el-tooltip slot="append" content="copy" placement="top">
          <el-button icon="el-icon-s-order" @click="onCopyUrl"></el-button>
        </el-tooltip>
      </el-input>
    </template>
    <template v-else>
      <el-input v-model="title" placeholder="タイトルを入力してください" maxlength="30" show-word-limit></el-input>
    </template>

    <span slot="footer" class="dialog-footer">
      <el-button v-if="!url" type="primary" :disabled="title.length === 0" @click="onCreateMapUrl">作成する</el-button>
      <el-button @click="onClose">キャンセル</el-button>
    </span>
  </el-dialog>
</template>

<script>
import GeoApi from '@/requests/geo-api'

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
    }
  },

  methods: {
    onClose() {
      this.title = ''
      this.url = ''
      this.$emit('close')
    },

    onCreateMapUrl() {
      console.log(this.mapState)
      console.log(this.locations)
      console.log(this.cascader)
      this.url = `https://tool.geo.qazsato.com/viewmap/${this.title}`
    },

    async postShareMapState() {
      const api = new GeoApi('/share_map_states', {
        params: {
          title: this.title,
          zoom: this.mapState.zoom,
          latitude: this.mapState.center.lat,
          longitude: this.mapState.center.lng,
          analysis_type: this.cascader[0],
          analysis_level: this.cascader[1],
          locations: this.locations,
        },
      })
      const res = await api.post()
      return `https://tool.geo.qazsato.com/viewmap/${res.data.code}`
    },

    onCopyUrl() {
      const textArea = document.createElement('textarea')
      textArea.style.cssText = 'position:absolute;left:-100%'
      document.body.appendChild(textArea)
      textArea.value = this.url
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    },
  },
}
</script>

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
