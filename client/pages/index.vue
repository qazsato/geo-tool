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
      @changeCascader="onChangeCascader"
      @clickShare="onClickShare"
      @clickTable="onClickTable"
    />

    <GoogleMap
      :infowindows="infowindows"
      :geojsons="geojsons"
      :markers="markers"
      :heatmap="heatmap"
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
import { getInfowindowPosition } from '@/utils/mesh'
import { fetchAddressGeoJSON, fetchMeshGeoJSON, fetchHeatmap, fetchMarkers } from '@/utils/map-data'
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
      this.locations = locations
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
            message: e.response.data.error.message,
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
      if (!this.isAddress) {
        return
      }
      this.infowindows = []
      const count = event.feature.getProperty('count')
      const addressName = event.feature.getProperty('addressName')
      const infowindow = new this.google.maps.InfoWindow({
        content: `${addressName} : ${count}件`,
        position: event.latLng,
        pixelOffset: new this.google.maps.Size(0, -5),
        disableAutoPan: true,
      })
      this.infowindows = [infowindow]
    },

    onMouseoverData(event) {
      if (!this.isMesh) {
        return
      }
      const code = event.feature.getProperty('code')
      const count = event.feature.getProperty('count')
      const geojson = this.geojsons.filter((g) => g.properties.code === code)[0]
      const position = getInfowindowPosition(this.google, geojson)
      const infowindow = new this.google.maps.InfoWindow({
        content: `${code} : ${count}件`,
        position,
        disableAutoPan: true,
      })
      this.infowindows = [infowindow]
    },
  },

  head() {
    return {
      title: 'TOP',
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
    @include sp() {
      display: none;
    }
  }
}
</style>
