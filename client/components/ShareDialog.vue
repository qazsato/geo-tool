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
}
</style>
