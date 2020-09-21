<template>
  <el-container v-loading="loading" class="page">
    <el-header>
      <Header :title="title" />
    </el-header>
    <el-main>
      <GoogleMap
        :theme="theme"
        :color="color"
        :infowindows="infowindows"
        :geojsons="geojsons"
        :markers="markers"
        :heatmap="heatmap"
        @mouseoutData="onMouseoutData"
        @mousemoveData="onMousemoveData"
        @mouseoverData="onMouseoverData"
      />
      <DataDrawer :title="drawerTitle" :visible="drawerVisible" :data="tableData" @close="closeDrawer" />
    </el-main>
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'
import GeoApi from '@/requests/geo-api'
import { getInfowindowPosition } from '@/utils/mesh'
import { fetchAddressGeoJSON, fetchMeshGeoJSON, fetchHeatmap, fetchMarkers } from '@/utils/map-data'
import { mapTheme } from '@/constants/view-map-state'

export default {
  async asyncData(context) {
    const code = context.params.code
    const api = new GeoApi(`/view_map_states/${code}`)
    const res = await api.get()
    return {
      data: res.data,
      title: res.data.title,
      locations: res.data.locations,
      analysisType: res.data.analysis_type,
      analysisLevel: res.data.analysis_level,
      theme: mapTheme.get(res.data.map_theme).key,
      color: res.data.polygon_color,
    }
  },

  data() {
    return {
      loading: false,
      infowindows: [],
      geojsons: [],
      markers: [],
      heatmap: null,
      tableData: [],
      drawerVisible: false,
    }
  },

  computed: {
    drawerTitle() {
      return `ポリゴンデータ (全${this.tableData.length}件)`
    },

    isAddress() {
      return this.analysisType === 1
    },

    isMesh() {
      return this.analysisType === 2
    },

    isHeatmap() {
      return this.analysisType === 3
    },

    isMarkerCluster() {
      return this.analysisType === 4
    },
  },

  async mounted() {
    await this.loadMap()
    this.google = this.$store.state.map.google
    this.drawMap()
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),

    onClickTable() {
      this.drawerVisible = true
    },

    closeDrawer() {
      this.drawerVisible = false
    },

    async drawMap() {
      this.loading = true
      this.clearData()
      if (this.isAddress) {
        try {
          const { counts, geojsons } = await fetchAddressGeoJSON(this.locations, this.analysisLevel)
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
          const { counts, geojsons } = fetchMeshGeoJSON(this.locations, this.analysisLevel)
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
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}

.el-header {
  padding: 0;
}

.el-main {
  position: relative;
  padding: 0;
  height: 100%;
}

.map-action {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}
</style>