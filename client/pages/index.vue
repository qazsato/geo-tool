<template>
  <el-container v-loading="loading" class="page">
    <el-header>
      <Header :title="title" @clickShare="onClickShare" @clickImport="onClickImport" />
    </el-header>
    <el-main>
      <div v-if="locations.length > 0" class="button-area">
        <Cascader class="cascader" @change="onChange" />
        <!-- <el-button icon="el-icon-share" @click="onClickShare">地図を共有する</el-button> -->
        <el-button v-if="tableData.length > 0" icon="el-icon-data-analysis" @click="onClickTable"
          >表・グラフで確認する</el-button
        >
      </div>
      <GoogleMap
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

    <ShareDialog :visible="shareDialogVisible" @close="closeDialog" />
    <ImportDialog :visible="importDialogVisible" @import="onImport" @close="closeDialog" />
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'
import _ from 'lodash'
import japanmesh from 'japanmesh'
import GeoApi from '@/requests/geo-api'

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
      tableData: [],
      shareDialogVisible: false,
      importDialogVisible: false,
      drawerVisible: false,
      activeTab: 'table',
    }
  },

  computed: {
    drawerTitle() {
      return `ポリゴンデータ (全${this.tableData.length}件)`
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

    closeDrawer() {
      this.drawerVisible = false
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
        this.geojsons = await this.fetchAddressGeoJSON(this.locations, level).catch((e) => {
          this.$notify.error({
            title: 'Error',
            message: e.response.data.error.message,
          })
        })
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
      this.tableData = res.data.map((d) => {
        return {
          key: d.address.name,
          count: d.count,
        }
      })
      const max = Math.max(...res.data.map((d) => d.count))
      const codes = res.data.map((d) => d.address.code)
      const shape = await this.fetchAddressShape(codes)
      shape.features.forEach((feature) => {
        const d = res.data.filter((d) => d.address.code === feature.properties.code)[0]
        const opacity = (d.count / max) * 0.9
        feature.properties.count = d.count
        feature.properties.addressName = d.address.name
        feature.properties.strokeWeight = 1
        feature.properties.fillOpacity = opacity
      })
      geojsons.push(shape)
      return geojsons
    },

    fetchAddressShape(allCodes) {
      const MAX_CODE_COUNT = 100 // APIのコードの最大指定数
      const shape = {
        features: [],
        type: 'FeatureCollection',
      }
      // APIの最大コード指定数を超えるとエラーとなるため分割する
      const codes = _.chunk(allCodes, MAX_CODE_COUNT)
      return new Promise((resolve, reject) => {
        const promises = codes.map((code) => {
          const api = new GeoApi('/addresses/shape', { codes: code.toString() })
          return api.get()
        })
        axios
          .all(promises)
          .then(
            axios.spread((...results) => {
              results.forEach((r) => r.data.features.forEach((f) => shape.features.push(f)))
              resolve(shape)
            })
          )
          .catch((e) => {
            reject(e)
          })
      })
    },

    fetchMeshGeoJSON(locations, level) {
      try {
        const geojsons = []
        const counts = this.calcCountGroupByCode(locations, level)
        this.tableData = counts.map((c, i) => {
          return {
            key: c.code,
            count: c.count,
          }
        })
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
      } catch (e) {
        this.$notify.error({
          title: 'Error',
          message: '地域メッシュの変換に失敗しました',
        })
      }
    },

    fetchHeatmap(locations) {
      const latLngs = locations.map((l) => new this.google.maps.LatLng(l.lat, l.lng))
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
      this.tableData = []
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

      return new this.google.maps.LatLng(northernmost[1], (westernmost[0] + easternmost[0]) / 2)
    },

    onClickTable() {
      this.drawerVisible = true
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

.button-area {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;

  .cascader,
  .el-button {
    margin: 5px;
  }
}
</style>
