<template>
  <Page v-loading="loading">
    <template v-slot:header>
      <Header :title="title">
        <el-button v-if="tableData.length > 0" class="table-button" icon="el-icon-data-analysis" @click="onClickTable"
          >表・グラフで確認する</el-button
        >
      </Header>
    </template>

    <GoogleMap
      :default-zoom="zoom"
      :default-center="center"
      :default-theme="theme"
      :default-color="color"
      :infowindows="infowindows"
      :geojsons="geojsons"
      :markers="markers"
      :heatmap="heatmap"
      enable-marker-cluster
      @mouseoutData="onMouseoutData"
      @mousemoveData="onMousemoveData"
      @mouseoverData="onMouseoverData"
    />

    <DataDrawer :title="drawerTitle" :visible="drawerVisible" :data="tableData" @close="closeDrawer" />
  </Page>
</template>

<script>
import { mapActions } from 'vuex'
import GeoApi from '@/requests/geo-api'
import {
  fetchAddressGeoJSON,
  fetchMeshGeoJSON,
  fetchHeatmap,
  fetchMarkers,
  createAddressCountInfowindow,
  createMeshCountInfowindow,
} from '@/utils/map-data'
import { mapTheme, analysisType } from '@/constants/view-map-state'

export default {
  async asyncData({ params, error }) {
    try {
      const code = params.code
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
        zoom: res.data.zoom,
        center: res.data.location,
      }
    } catch (e) {
      error({ statusCode: 404, message: 'Not Found' })
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
      return this.analysisType === analysisType.address.value
    },

    isMesh() {
      return this.analysisType === analysisType.mesh.value
    },

    isHeatmap() {
      return this.analysisType === analysisType.heatmap.value
    },

    isMarkerCluster() {
      return this.analysisType === analysisType.cluster.value
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
      title: this.title,
    }
  },
}
</script>

<style lang="scss" scoped>
.table-button {
  /deep/ span {
    @include xs() {
      display: none;
    }
  }
}
</style>
