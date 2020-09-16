<template>
  <el-container class="page">
    <el-header>
      <Header
        :title="title"
        @clickShare="onClickShare"
        @clickImport="onClickImport"
      />
    </el-header>
    <el-main v-loading="loading">
      <Cascader
        v-if="locations.length > 0"
        class="cascader"
        @change="onChange"
      />
      <GoogleMap
        :infowindows="infowindows"
        :geojsons="geojsons"
        :markers="markers"
        :heatmap="heatmap"
        @mouseoutData="onMouseoutData"
        @mousemoveData="onMousemoveData"
        @mouseoverData="onMouseoverData"
      />
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
import _ from 'lodash'
import japanmesh from 'japanmesh'
import GeoApi from '@/requests/geo_api'

export default {
  data() {
    return {
      title: '',
      cascader: ['cluster'],
      loading: false,
      locations: [],
      infowindows: [],
      geojsons: [],
      markers: [],
      heatmap: null,
      shareDialogVisible: false,
      importDialogVisible: false,
    }
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
      this.cascader = value
      this.drawMap()
    },

    async drawMap() {
      this.loading = true
      this.clearData()
      const firstItem = this.cascader[0]
      const secondItem = this.cascader[1]
      if (firstItem === 'address') {
        const level = Number(secondItem)
        this.geojsons = await this.fetchAddressGeoJSON(this.locations, level)
      } else if (firstItem === 'mesh') {
        const level = Number(secondItem)
        this.geojsons = this.fetchMeshGeoJSON(this.locations, level)
      } else if (firstItem === 'heatmap') {
        this.heatmap = this.fetchHeatmap(this.locations)
      } else if (firstItem === 'cluster') {
        this.markers = this.fetchMarkers(this.locations)
      }
      this.loading = false
    },

    async fetchAddressGeoJSON(locations, level) {
      const geojsons = []
      const api = new GeoApi('/analytics/addresses/contains', {
        locations: locations.map((l) => `${l.lat},${l.lng}`),
        level,
      })
      const res = await api.post()
      const max = Math.max(...res.data.map((d) => d.count))
      const codes = res.data.map((d) => d.address.code)
      const shapeApi = new GeoApi('/addresses/shape', {
        codes: codes.toString(),
      })
      const shapeRes = await shapeApi.get()
      shapeRes.data.features.forEach((feature) => {
        const d = res.data.filter(
          (d) => d.address.code === feature.properties.code
        )[0]
        const opacity = (d.count / max) * 0.9
        feature.properties.count = d.count
        feature.properties.addressName = d.address.name
        feature.properties.strokeWeight = 1
        feature.properties.fillOpacity = opacity
      })
      geojsons.push(shapeRes.data)
      return geojsons
    },

    fetchMeshGeoJSON(locations, level) {
      const geojsons = []
      const counts = this.calcCountGroupByCode(locations, level)
      const max = Math.max(...counts.map((c) => c.count))
      counts.forEach((c) => {
        const opacity = (c.count / max) * 0.9
        const geojson = japanmesh.toGeoJSON(c.code, {
          code: c.code,
          count: c.count,
          strokeWeight: 1,
          fillOpacity: opacity,
        })
        geojsons.push(geojson)
      })
      return geojsons
    },

    fetchHeatmap(locations) {
      const latLngs = locations.map(
        (l) => new this.google.maps.LatLng(l.lat, l.lng)
      )
      const heatmap = new this.google.maps.visualization.HeatmapLayer({
        data: new this.google.maps.MVCArray(latLngs),
      })
      return heatmap
    },

    fetchMarkers(locations) {
      const markers = []
      locations.forEach((l) => {
        const position = new this.google.maps.LatLng(l.lat, l.lng)
        const marker = new this.google.maps.Marker({ position })
        markers.push(marker)
      })
      return markers
    },

    clearData() {
      this.infowindows = []
      this.geojsons = []
      this.markers = []
      this.heatmap = null
    },

    calcCountGroupByCode(locations, level) {
      const count = {}
      locations.forEach((location) => {
        const code = japanmesh.toCode(location.lat, location.lng, level)
        if (count[code]) {
          count[code]++
        } else {
          count[code] = 1
        }
      })
      return Object.entries(count).map(([code, count]) => {
        return { code, count }
      })
    },

    onMouseoutData(event) {
      this.infowindows = []
    },

    onMousemoveData(event) {
      if (this.cascader[0] !== 'address') {
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
      if (this.cascader[0] !== 'mesh') {
        return
      }
      const code = event.feature.getProperty('code')
      const count = event.feature.getProperty('count')
      const position = this.getInfowindowPosition(code)
      const infowindow = new this.google.maps.InfoWindow({
        content: `${code} : ${count}件`,
        position,
        disableAutoPan: true,
      })
      this.infowindows = [infowindow]
    },

    getInfowindowPosition(code) {
      const shape = this.geojsons.filter((g) => g.properties.code === code)[0]
      const coords = _.flatten(shape.geometry.coordinates)
      const northernmost = _.maxBy(coords, (c) => c[1])
      const westernmost = _.minBy(coords, (c) => c[0])
      const easternmost = _.maxBy(coords, (c) => c[0])

      return new this.google.maps.LatLng(
        northernmost[1],
        (westernmost[0] + easternmost[0]) / 2
      )
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
  height: 100%;
}

.cascader {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
</style>
