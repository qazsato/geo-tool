<template>
  <el-container class="page">
    <el-header>
      <Header
        :title="title"
        @clickShare="onClickShare"
        @clickImport="onClickImport"
      />
    </el-header>
    <el-main>
      <Cascader
        v-if="locations.length > 0"
        class="cascader"
        @change="onChange"
      />
      <GoogleMap :markers="markers" />
    </el-main>

    <ShareDialog :visible="shareDialogVisible" @close="closeDialog" />
    <ImportDialog
      :visible="importDialogVisible"
      @import="onImport"
      @close="closeDialog"
    />
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      title: '',
      locations: [],
      markers: [],
      shareDialogVisible: false,
      importDialogVisible: false,
    }
  },

  watch: {
    locations(val) {
      this.locations.forEach((l) => {
        const position = new this.google.maps.LatLng(l.lat, l.lng)
        const marker = new this.google.maps.Marker({ position })
        this.markers.push(marker)
      })
    },
  },

  async mounted() {
    await this.loadMap()
    this.google = this.$store.state.map.google
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),

    onClickShare() {
      this.shareDialogVisible = true
    },

    onClickImport() {
      this.importDialogVisible = true
    },

    closeDialog() {
      this.shareDialogVisible = false
      this.importDialogVisible = false
    },

    onImport(locations) {
      this.locations = locations
    },

    onChange(value) {
      console.log('v', value)
    },
  },
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
}

.el-main {
  position: relative;
  padding: 0;
}

.cascader {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
</style>
