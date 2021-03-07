<template>
  <Page v-loading="loading">
    <template v-slot:header>
      <Header :title="title">
        <el-button class="import-button" icon="el-icon-place" @click="onClickImport">データ読み込み</el-button>
      </Header>
    </template>

    <MapAction
      v-if="locations.length > 0"
      :cascader="cascader"
      :data="tableData"
      class="map-acition"
      visible-share-button
      visible-table-button
      @changeCascader="onChangeCascader"
      @clickShare="onClickShare"
      @clickTable="onClickTable"
    />

    <GoogleMap
      :infowindows="infowindows"
      :geojsons="geojsons"
      :markers="markers"
      :heatmap="heatmap"
      :auto-adjust-markers="isAutoAdjust"
      :auto-adjust-geojsons="isAutoAdjust"
      :auto-adjust-heatmap="isAutoAdjust"
      enable-marker-cluster
      @stateChanged="onStateChanged"
      @mouseoutData="onMouseoutData"
      @mousemoveData="onMousemoveData"
      @mouseoverData="onMouseoverData"
    />

    <DataDrawer :title="drawerTitle" :visible="drawerVisible" :data="tableData" @close="closeDrawer" />

    <ShareDialog
      :map-state="mapState"
      :locations="locations"
      :cascader="cascader"
      :visible="shareDialogVisible"
      @close="closeDialog"
    />

    <ImportDialog :visible="importDialogVisible" @import="onImport" @close="closeDialog" />
  </Page>
</template>

<script>
import { mapActions } from 'vuex'
import {
  fetchAddressGeoJSON,
  fetchMeshGeoJSON,
  fetchHeatmap,
  fetchMarkers,
  createAddressCountInfowindow,
  createMeshCountInfowindow,
} from '@/utils/map-data'
import { analysisType } from '@/constants/view-map-state'

export default {
  data() {
    return {
      title: '',
      cascader: [analysisType.cluster.key],
      loading: false,
      mapState: null,
      locations: [],
      infowindows: [],
      geojsons: [],
      markers: [],
      heatmap: null,
      tableData: [],
      shareDialogVisible: false,
      importDialogVisible: false,
      drawerVisible: false,
      isAutoAdjust: false,
    }
  },

  computed: {
    drawerTitle() {
      return `ポリゴンデータ (全${this.tableData.length}件)`
    },

    isAddress() {
      return this.cascader[0] === analysisType.address.key
    },

    isMesh() {
      return this.cascader[0] === analysisType.mesh.key
    },

    isHeatmap() {
      return this.cascader[0] === analysisType.heatmap.key
    },

    isMarkerCluster() {
      return this.cascader[0] === analysisType.cluster.key
    },
  },

  watch: {
    locations(val) {
      this.drawMap()
    },
  },

  async mounted() {
    await this.loadMap()
    this.google = this.$store.state.map.google
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),

    onClickImport() {
      this.importDialogVisible = true
    },

    onClickShare() {
      this.shareDialogVisible = true
    },

    onClickTable() {
      this.drawerVisible = true
    },

    closeDialog() {
      this.shareDialogVisible = false
      this.importDialogVisible = false
    },

    closeDrawer() {
      this.drawerVisible = false
    },

    onImport(locations) {
      // MEMO: インポート時のみ拡縮の自動調整をおこなう
      this.isAutoAdjust = true
      this.locations = locations
      setTimeout(() => (this.isAutoAdjust = false))
    },

    onChangeCascader(value) {
      this.cascader = value
      this.drawMap()
    },

    async drawMap() {
      this.loading = true
      this.clearData()
      if (this.isAddress) {
        try {
          const level = Number(this.cascader[1])
          const { counts, geojsons } = await fetchAddressGeoJSON(this.locations, level)
          this.tableData = counts
          this.geojsons = geojsons
        } catch (e) {
          this.$notify.error({
            title: 'Error',
            message: e.message || e.response.data.error.message,
          })
        }
      } else if (this.isMesh) {
        try {
          const level = Number(this.cascader[1])
          const { counts, geojsons } = fetchMeshGeoJSON(this.locations, level)
          this.tableData = counts
          this.geojsons = geojsons
        } catch (e) {
          this.$notify.error({
            title: 'Error',
            message: '地域メッシュの変換に失敗しました',
          })
        }
      } else if (this.isHeatmap) {
        this.heatmap = fetchHeatmap(this.google, this.locations)
      } else if (this.isMarkerCluster) {
        this.markers = fetchMarkers(this.google, this.locations)
      }
      this.loading = false
    },

    clearData() {
      this.infowindows = []
      this.geojsons = []
      this.markers = []
      this.heatmap = null
      this.tableData = []
    },

    onStateChanged(state) {
      this.mapState = state
    },

    onMouseoutData(event) {
      this.infowindows = []
    },

    onMousemoveData(event) {
      if (this.isAddress) {
        const infowindow = createAddressCountInfowindow(this.google, event)
        this.infowindows = [infowindow]
      }
    },

    onMouseoverData(event) {
      if (this.isAddress) {
        const infowindow = createAddressCountInfowindow(this.google, event)
        this.infowindows = [infowindow]
      } else if (this.isMesh) {
        const infowindow = createMeshCountInfowindow(this.google, this.geojsons, event)
        this.infowindows = [infowindow]
      }
    },
  },

  head() {
    return {
      title: 'Geo Tool',
      titleTemplate: '',
    }
  },
}
</script>

<style lang="scss" scoped>
.map-action {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

.import-button {
  /deep/ span {
    @include xs() {
      display: none;
    }
  }
}
</style>
