<template>
  <div class="map-container" :style="{ width: width, height: height }">
    <div ref="map" class="map"></div>
    <div class="left-controller">
      <div v-if="isVisiblePolygonController" class="polygon-controller">
        <el-color-picker v-model="color" size="medium" :predefine="predefineColors"></el-color-picker>
        <el-switch v-if="visibleSwitch" v-model="isVisiblePolygon" :active-color="color"></el-switch>
      </div>
      <el-select v-model="theme" size="medium">
        <el-option v-for="(t, i) in themes" :key="i" :label="t" :value="t" class="theme-option">
          <img :src="require(`~/assets/images/map/themes/${t}.png`)" />
          <span class="name">{{ t }}</span>
        </el-option>
      </el-select>
    </div>
    <div class="right-bottom-controller">
      <div>
        <el-tooltip :disabled="isLight" content="自動スリープを防止します" placement="left">
          <el-button icon="el-icon-sunny" :type="lightType" circle @click="toggleLight"></el-button>
        </el-tooltip>
      </div>
      <div>
        <el-tooltip :disabled="isCompass" content="向いている方向を上にします" placement="left">
          <el-button icon="el-icon-discover" :type="compassType" circle @click="toggleCompass"></el-button>
        </el-tooltip>
      </div>
      <div>
        <el-tooltip :disabled="isTracking" content="現在位置を取得します" placement="left">
          <el-button icon="el-icon-position" :type="trackingType" circle @click="toggleTracking"></el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import MarkerClusterer from '@google/markerclustererplus'
import _ from 'lodash'
import ls from 'local-storage'
import NoSleep from 'nosleep.js'
import config from '@/config'
import { adjustViewPort } from '@/utils/map'
import { toLocations } from '@/utils/geojson'
import { mapTheme } from '@/constants/view-map-state'
import ImageLocation from '@/assets/images/map/location.svg'
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

    defaultZoom: {
      required: false,
      type: Number,
      default: 8,
    },

    defaultCenter: {
      required: false,
      type: Object,
      default() {
        const lat = config.default_location.lat
        const lng = config.default_location.lng
        return { lat, lng }
      },
    },

    defaultTheme: {
      required: false,
      type: String,
      default: null,
    },

    defaultColor: {
      required: false,
      type: String,
      default: null,
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

    focusLocations: {
      required: false,
      type: Array,
      default() {
        return []
      },
    },

    enableMarkerCluster: {
      required: false,
      type: Boolean,
      default: false,
    },

    autoAdjustMarkers: {
      required: false,
      type: Boolean,
      default: false,
    },

    autoAdjustGeojsons: {
      required: false,
      type: Boolean,
      default: false,
    },

    autoAdjustHeatmap: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      google: null,
      map: null,
      color: this.getDefaultColor(),
      predefineColors: ['#409eff', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585'],
      theme: this.getDefaultTheme(),
      themes: mapTheme.enums.map((e) => e.key),
      isVisiblePolygon: true,
      localMarkers: [],
      localInfowindows: [],
      localHeatmap: null,
      visibleSwitch: true,
      watchId: null,
      currentLocation: null,
      isLight: false,
      isCompass: false,
      isTracking: false,
      isDragging: false,
      noSleep: null,
    }
  },

  computed: {
    isVisiblePolygonController() {
      return this.geojsons.length > 0
    },

    isSatellite() {
      return this.theme === 'satellite'
    },

    lightType() {
      return this.isLight ? 'primary' : 'default'
    },

    compassType() {
      return this.isCompass ? 'primary' : 'default'
    },

    trackingType() {
      return this.isTracking ? 'primary' : 'default'
    },
  },

  watch: {
    color(val) {
      // colorの値が更新されても色が反映されないため、v-ifを使った再レンダリングをおこなう
      this.visibleSwitch = false
      this.$nextTick(() => (this.visibleSwitch = true))
      this.drawData()
      ls(LS_COLOR_KEY, val)
      this.$emit('stateChanged', this.getMapState())
    },

    theme(val) {
      if (this.isSatellite) {
        this.map.setMapTypeId(val)
      } else {
        const mapId = config.map_theme[val]
        this.initMap(mapId)
      }
      ls(LS_THEME_KEY, val)
      this.$emit('stateChanged', this.getMapState())
    },

    isVisiblePolygon(val) {
      this.drawData()
    },

    markers(val) {
      if (this.markerClusterer) {
        this.markerClusterer.clearMarkers()
      }

      const diffMarkers = _.difference(this.localMarkers, this.markers)
      diffMarkers.forEach((marker) => marker.setMap(null))
      this.localMarkers = this.markers

      if (this.enableMarkerCluster) {
        this.markerClusterer = new MarkerClusterer(this.map, this.markers, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        })
      } else {
        this.markers.forEach((marker) => {
          marker.setMap(this.map)
        })
      }

      if (this.autoAdjustMarkers) {
        const locations = this.markers.map((m) => {
          return { lat: m.position.lat(), lng: m.position.lng() }
        })
        if (locations.length > 0) {
          adjustViewPort(this.google, this.map, locations)
        }
      }
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

      if (this.autoAdjustGeojsons) {
        const locations = this.getVisibleLocations()
        if (locations.length > 0) {
          adjustViewPort(this.google, this.map, locations)
        }
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

      if (this.autoAdjustHeatmap && this.heatmap) {
        const locations = this.heatmap.data.Kb.map((p) => {
          return { lat: p.lat(), lng: p.lng() }
        })
        if (locations.length > 0) {
          adjustViewPort(this.google, this.map, locations)
        }
      }
    },

    focusLocations(val) {
      if (val.length > 0) {
        adjustViewPort(this.google, this.map, val)
      }
    },

    isLight(val) {
      if (val) {
        if (this.noSleep === null) {
          this.noSleep = new NoSleep()
        }
        this.noSleep.enable()
      } else {
        this.noSleep.disable()
      }
    },

    isCompass(val) {
      if (val) {
        this.map.setTilt(45)
        if (window.DeviceOrientationEvent) {
          // iOS(13以降)は許可が必要
          if (window.DeviceOrientationEvent.requestPermission) {
            window.DeviceOrientationEvent.requestPermission().then((response) => {
              if (response === 'granted') {
                window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
              }
            })
          } else {
            window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
          }
        }
      } else {
        this.map.setTilt(0)
        window.removeEventListener('deviceorientation', this.onDeviceOrientation, true)
      }
    },

    isTracking(val) {
      if (val) {
        this.map.setZoom(20)
        this.watchId = navigator.geolocation.watchPosition((event) => {
          const lat = event.coords.latitude
          const lng = event.coords.longitude
          const position = new this.google.maps.LatLng(lat, lng)
          if (this.currentLocation) {
            this.currentLocation.setPosition(position)
          } else {
            this.currentLocation = new this.google.maps.Marker({
              position,
              map: this.map,
              icon: ImageLocation,
            })
          }
          this.map.panTo(position)
        })
      } else {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
        if (this.currentLocation) {
          this.currentLocation.setMap(null)
          this.currentLocation = null
        }
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
      if (this.defaultColor) {
        return this.defaultColor
      }
      const color = ls(LS_COLOR_KEY)
      return color || '#409eff'
    },

    getDefaultTheme() {
      if (this.defaultTheme) {
        return this.defaultTheme
      }
      const theme = ls(LS_THEME_KEY)
      return theme || mapTheme.logistics.key
    },

    initMap(mapId) {
      if (!this.$refs.map) {
        return
      }
      const zoom = this.map ? this.map.getZoom() : this.defaultZoom
      const center = this.map
        ? this.map.getCenter()
        : new this.google.maps.LatLng(this.defaultCenter.lat, this.defaultCenter.lng)
      if (!mapId) {
        mapId = config.map_theme[this.getDefaultTheme()]
      }
      this.map = new this.google.maps.Map(this.$refs.map, {
        zoom,
        center,
        mapTypeId: this.isSatellite ? this.google.maps.MapTypeId.SATELLITE : this.google.maps.MapTypeId.ROADMAP,
        clickableIcons: false,
        disableDefaultUI: true,
        zoomControl: true,
        scaleControl: true,
        mapId,
      })
    },

    bindMap() {
      this.map.addListener('click', (e) => this.$emit('click', e))
      this.map.addListener('contextmenu', (e) => this.$emit('contextmenu', e))
      this.map.addListener('bounds_changed', (e) => this.$emit('stateChanged', this.getMapState()))
      this.map.data.addListener('click', (e) => this.$emit('clickData', e))
      this.map.data.addListener('mouseout', (e) => this.$emit('mouseoutData', e))
      this.map.data.addListener('mousemove', (e) => this.$emit('mousemoveData', e))
      this.map.data.addListener('mouseover', (e) => this.$emit('mouseoverData', e))
      this.map.addListener('dragstart', () => (this.isDragging = true))
      this.map.addListener('dragend', () => (this.isDragging = false))
      this.map.addListener('center_changed', () => {
        if (this.isDragging) {
          this.isTracking = false
          this.isCompass = false
        }
      })
    },

    drawData() {
      this.map.data.setStyle((feature) => {
        const strokeWeight = feature.getProperty('strokeWeight')
        const strokeColor = this.color
        const fillColor = this.color
        const fillOpacity = feature.getProperty('fillOpacity')
        const zIndex = feature.getProperty('zIndex')
        const visible = this.isVisiblePolygon
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

    toggleLight() {
      this.isLight = !this.isLight
    },

    toggleCompass() {
      this.isCompass = !this.isCompass
    },

    toggleTracking() {
      this.isTracking = !this.isTracking
    },

    onDeviceOrientation(event) {
      const heading = event.webkitCompassHeading
      if (Math.abs(heading - this.map.getHeading()) >= 3) {
        this.map.setHeading(heading)
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

.left-controller {
  position: absolute;
  left: 5px;
  bottom: 30px;
  width: 110px;

  .polygon-controller {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .el-switch {
      margin-left: 10px;
    }
  }

  ::v-deep .el-input {
    @include xs() {
      font-size: 16px;
    }
  }
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
    font-size: 16px;
    font-weight: bold;
    text-shadow: 1px 1px 1px #999;
  }

  &:hover {
    opacity: 0.9;
  }
}

.right-bottom-controller {
  position: absolute;
  right: 10px;
  bottom: 120px;

  > div:not(:last-child) {
    margin-bottom: 10px;
  }
}
</style>
