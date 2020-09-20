<template>
  <div class="map-container" :style="{ width: width, height: height }">
    <div ref="map" class="map"></div>
    <div class="controller">
      <el-color-picker
        v-if="geojsons.length > 0"
        v-model="color"
        size="medium"
        :predefine="predefineColors"
      ></el-color-picker>
      <el-select v-model="theme" size="medium">
        <el-option v-for="(t, i) in themes" :key="i" :label="t" :value="t" class="theme-option">
          <img :src="require(`~/assets/images/map/themes/${t}.png`)" />
          <span class="name">{{ t }}</span>
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import MarkerClusterer from '@google/markerclustererplus'
import _ from 'lodash'
import ls from 'local-storage'
import config from '@/config'
import { adjustViewPort } from '@/utils/map'
import { toLocations } from '@/utils/geojson'
const LS_COLOR_KEY = 'google-map-data-color'
const LS_THEME_KEY = 'google-map-skin-theme'
export default {
  props: {
    width: {
      required: false,
      type: String,
      default: '100%',
    },

    height: {
      required: false,
      type: String,
      default: '100%',
    },

    markers: {
      required: false,
      type: Array,
      default() {
        return []
      },
    },

    infowindows: {
      required: false,
      type: Array,
      default() {
        return []
      },
    },

    geojsons: {
      required: false,
      type: Array,
      default() {
        return []
      },
    },

    heatmap: {
      required: false,
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      google: null,
      map: null,
      color: this.getDefaultColor(),
      predefineColors: ['#409eff', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585'],
      theme: this.getDefaultTheme(),
      themes: ['standard', 'silver', 'retro', 'night', 'dark', 'aubergine'],
      localMarkers: [],
      localInfowindows: [],
      localHeatmap: null,
      localMarkerClusterer: null,
    }
  },

  watch: {
    color(val) {
      this.drawData()
      ls(LS_COLOR_KEY, this.color)
      this.$emit('stateChanged', this.getMapState())
    },

    theme(val) {
      this.map.setMapTypeId(val)
      ls(LS_THEME_KEY, this.theme)
      this.$emit('stateChanged', this.getMapState())
    },

    markers(val) {
      if (this.markerClusterer) {
        this.markerClusterer.clearMarkers()
      }

      const diffMarkers = _.difference(this.localMarkers, this.markers)
      diffMarkers.forEach((marker) => marker.setMap(null))

      this.markers.forEach((marker) => {
        marker.setMap(this.map)
      })
      this.localMarkers = this.markers

      this.markerClusterer = new MarkerClusterer(this.map, this.markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      })
    },

    infowindows(val) {
      const diffInfowindows = _.difference(this.localInfowindows, this.infowindows)
      diffInfowindows.forEach((infowindow) => infowindow.setMap(null))

      this.infowindows.forEach((infowindow) => {
        infowindow.setMap(this.map)
      })
      this.localInfowindows = this.infowindows
    },

    geojsons(val) {
      // GeoJSON一括クリア
      this.map.data.forEach((feature) => {
        this.map.data.remove(feature)
      })

      this.geojsons.forEach((geojson) => {
        this.map.data.addGeoJson(geojson)
      })

      this.drawData()

      const locations = this.getVisibleLocations()
      if (locations.length > 0) {
        adjustViewPort(this.google, this.map, locations)
      }
    },

    heatmap(val) {
      if (this.heatmap) {
        this.heatmap.setMap(this.map)
        this.localHeatmap = this.heatmap
      } else {
        this.localHeatmap.setMap(null)
        this.localHeatmap = null
      }
    },
  },

  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'map/load') {
        this.google = state.map.google
        this.initMap()
        this.bindMap()
      }
    })
  },

  methods: {
    getDefaultColor() {
      const color = ls(LS_COLOR_KEY)
      return color || '#409eff'
    },

    getDefaultTheme() {
      const theme = ls(LS_THEME_KEY)
      return theme || 'silver'
    },

    initMap() {
      if (!this.$refs.map) return
      const lat = config.default_location.lat
      const lng = config.default_location.lng
      const position = new this.google.maps.LatLng(lat, lng)
      this.map = new this.google.maps.Map(this.$refs.map, {
        zoom: 8,
        center: position,
        mapTypeId: this.theme,
        clickableIcons: false,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControlOptions: {
          mapTypeIds: this.themes,
        },
      })
      this.themes.forEach((t) => {
        const s = new this.google.maps.StyledMapType(config.map_theme[t])
        this.map.mapTypes.set(t, s)
      })
    },

    bindMap() {
      this.map.addListener('click', (e) => this.$emit('click', e))
      this.map.addListener('bounds_changed', (e) => this.$emit('stateChanged', this.getMapState()))
      this.map.data.addListener('click', (e) => this.$emit('clickData', e))
      this.map.data.addListener('mouseout', (e) => this.$emit('mouseoutData', e))
      this.map.data.addListener('mousemove', (e) => this.$emit('mousemoveData', e))
      this.map.data.addListener('mouseover', (e) => this.$emit('mouseoverData', e))
    },

    drawData() {
      this.map.data.setStyle((feature) => {
        const strokeWeight = feature.getProperty('strokeWeight')
        const strokeColor = this.color
        const fillColor = this.color
        const fillOpacity = feature.getProperty('fillOpacity')
        const zIndex = feature.getProperty('zIndex')
        const visible = feature.getProperty('visible')
        return {
          strokeWeight,
          strokeColor,
          fillColor,
          fillOpacity,
          zIndex,
          visible,
        }
      })
    },

    getVisibleLocations() {
      let locations = []
      this.geojsons.forEach((geojson) => {
        if (geojson.type === 'Feature') {
          if (geojson.properties.visible !== false) {
            locations = locations.concat(toLocations(geojson))
          }
        } else if (geojson.type === 'FeatureCollection') {
          geojson.features.forEach((f) => {
            if (f.properties.visible !== false) {
              locations = locations.concat(toLocations(f))
            }
          })
        }
      })
      return locations
    },

    getMapState() {
      return {
        center: this.map.center,
        zoom: this.map.zoom,
        theme: this.theme,
        color: this.color,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.controller {
  position: absolute;
  left: 5px;
  bottom: 30px;
  width: 110px;
}

.theme-option {
  position: relative;
  width: 180px;
  height: 38px;
  margin: 4px 8px;
  padding: 0;

  .name {
    position: absolute;
    top: 0;
    left: 15px;
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    text-shadow: 1px 1px 1px #999;
  }

  &:hover {
    opacity: 0.9;
  }
}
</style>
