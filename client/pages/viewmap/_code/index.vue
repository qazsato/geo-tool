<template>
  <Page v-loading="loading">
    <template #header>
      <Header :title="title" :description="description"></Header>
    </template>

    <MapAction
      v-if="locations.length > 0"
      :cascader="cascader"
      :data="tableData"
      class="map-acition"
      @changeCascader="onChangeCascader"
      @clickSlider="onClickSlider"
      @clickTable="onClickTable"
    />

    <GoogleMap
      :default-zoom="zoom"
      :default-center="center"
      :default-theme="theme"
      :default-color="color"
      :infowindows="infowindows"
      :geojsons="geojsons"
      :markers="markers"
      :heatmap="heatmap"
      :focus-locations="focusLocations"
      enable-marker-cluster
      @mouseoutData="onMouseoutData"
      @mousemoveData="onMousemoveData"
      @mouseoverData="onMouseoverData"
      @contextmenu="onContextmenu"
    />

    <DataDrawer
      :title="drawerTitle"
      :visible="drawerVisible"
      :data="tableData"
      @close="closeDrawer"
      @clickRow="clickRow"
    />

    <SliderDialog
      :visible="sliderDialogVisible"
      :min="minCount"
      :max="maxCount"
      :value="countRange"
      @close="closeDialog"
      @apply="applyCountRange"
    />
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
import { toLocations } from '@/utils/geojson'
import { POLYGON_LIMIT } from '@/constants/address'

export default {
  async asyncData({ params, error }) {
    try {
      const code = params.code
      const api = new GeoApi(`/view_map_states/${code}`)
      const res = await api.get()
      const cascader = [analysisType.get(res.data.analysis_type)]
      if (res.data.analysis_level) {
        cascader.push(res.data.analysis_level)
      }
      return {
        data: res.data,
        title: res.data.title,
        description: res.data.description,
        locations: res.data.locations,
        cascader,
        theme: mapTheme.get(res.data.map_theme).key,
        color: res.data.polygon_color,
        zoom: res.data.zoom,
        center: res.data.location,
        countRange:
          res.data.count_range_from && res.data.count_range_to
            ? [res.data.count_range_from, res.data.count_range_to]
            : null,
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
      focusLocations: [],
      tableData: [],
      sliderDialogVisible: false,
      drawerVisible: false,
      minCount: null,
      maxCount: null,
    }
  },

  head() {
    return {
      title: this.title,
      meta: [{ hid: 'description', name: 'description', content: this.description || 'Map Visualization Tool' }],
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

  async mounted() {
    await this.loadMap()
    this.google = this.$store.state.map.google
    this.drawMap()
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),

    onClickSlider() {
      this.sliderDialogVisible = true
    },

    onClickTable() {
      this.drawerVisible = true
    },

    closeDialog() {
      this.sliderDialogVisible = false
    },

    clickRow(code) {
      let features = this.geojsons
      // 住所
      if (this.geojsons.length === 1 && this.geojsons[0].type === 'FeatureCollection') {
        features = this.geojsons[0].features
      }
      const geojson = features.find((f) => f.properties.code === code)
      if (geojson) {
        this.focusLocations = toLocations(geojson)
        this.drawerVisible = false
      }
    },

    closeDrawer() {
      this.drawerVisible = false
    },

    applyCountRange(value) {
      this.countRange = value
      this.drawMap()
      this.sliderDialogVisible = false
    },

    async drawMap() {
      this.loading = true
      this.clearData()
      if (this.isAddress) {
        try {
          const level = Number(this.cascader[1])
          const { counts, geojsons, minCount, maxCount, countRange } = await fetchAddressGeoJSON(
            this.locations,
            level,
            this.countRange
          )
          if (counts.length > POLYGON_LIMIT) {
            this.$notify({
              title: 'Info',
              message: `住所数が ${POLYGON_LIMIT.toLocaleString()} 件を超えているため地図の描画はされません`,
              type: 'info',
            })
          }
          this.tableData = counts
          this.geojsons = geojsons
          this.minCount = minCount
          this.maxCount = maxCount
          this.countRange = countRange
        } catch (e) {
          this.$notify.error({
            title: 'Error',
            message: e.message || e.response.data.error.message,
          })
        }
      } else if (this.isMesh) {
        try {
          const level = Number(this.cascader[1])
          const { counts, geojsons, minCount, maxCount, countRange } = fetchMeshGeoJSON(
            this.locations,
            level,
            this.countRange
          )
          this.tableData = counts
          this.geojsons = geojsons
          this.minCount = minCount
          this.maxCount = maxCount
          this.countRange = countRange
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

    onContextmenu(event) {
      this.$confirm('選択した地点をストリートビューで確認しますか？', 'ストリートビュー', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
      }).then(() => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        const url = `https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=${lat},${lng}`
        window.open(url)
      })
    },

    onChangeCascader(value) {
      this.cascader = value
      this.minCount = null
      this.maxCount = null
      this.countRange = null
      this.drawMap()
    },
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

.table-button {
  /deep/ span {
    @include xs() {
      display: none;
    }
  }
}
</style>
