import _ from 'lodash'
import axios from 'axios'
import japanmesh from 'japanmesh'
import GeoApi from '@/requests/geo-api'
import { calcCountGroupByCode, getInfowindowPosition } from '@/utils/mesh'

export const fetchAddressGeoJSON = async (locations, level) => {
  const geojsons = []
  const api = new GeoApi('/analytics/addresses/contains', {
    locations,
    level,
  })
  const res = await api.post().catch((e) => {
    throw e
  })
  const data = res.data.sort((a, b) => b.count - a.count) // 件数多い順に並び替え
  const counts = data.map((d) => {
    return {
      key: d.address_name,
      count: d.count,
    }
  })
  const max = Math.max(...res.data.map((d) => d.count))
  const codes = res.data.map((d) => d.address_code)
  const shape = await fetchAddressShape(codes).catch((e) => {
    throw e
  })
  shape.features.forEach((feature) => {
    const d = res.data.filter((d) => d.address_code === feature.properties.code)[0]
    const opacity = (d.count / max) * 0.9
    feature.properties.name = d.address_name
    feature.properties.count = d.count
    feature.properties.strokeWeight = 1
    feature.properties.fillOpacity = opacity
  })
  geojsons.push(shape)
  return { counts, geojsons }
}

export const fetchMeshGeoJSON = (locations, level) => {
  const geojsons = []
  const results = calcCountGroupByCode(locations, level)
  const counts = results.map((c, i) => {
    return { key: c.code, count: c.count }
  })
  const max = Math.max(...results.map((c) => c.count))
  results.forEach((c) => {
    const opacity = (c.count / max) * 0.9
    const geojson = japanmesh.toGeoJSON(c.code, {
      code: c.code,
      name: c.code,
      count: c.count,
      strokeWeight: 1,
      fillOpacity: opacity,
    })
    geojsons.push(geojson)
  })
  return { counts, geojsons }
}

export const fetchHeatmap = (google, locations) => {
  const latLngs = locations.map((l) => new google.maps.LatLng(l.lat, l.lng))
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: new google.maps.MVCArray(latLngs),
  })
  return heatmap
}

export const fetchMarkers = (google, locations) => {
  const markers = []
  locations.forEach((l) => {
    const position = new google.maps.LatLng(l.lat, l.lng)
    const marker = new google.maps.Marker({ position })
    markers.push(marker)
  })
  return markers
}

function fetchAddressShape(allCodes) {
  const MAX_CODE_COUNT = 100 // APIのコードの最大指定数
  const shape = {
    features: [],
    type: 'FeatureCollection',
  }
  // APIの最大コード指定数を超えるとエラーとなるため分割する
  const codes = _.chunk(allCodes, MAX_CODE_COUNT)
  return new Promise((resolve, reject) => {
    const promises = codes.map((code) => {
      const api = new GeoApi('/addresses/shapes', {
        codes: code.toString(),
        limit: MAX_CODE_COUNT,
      })
      return api.get()
    })
    axios
      .all(promises)
      .then(
        axios.spread((...results) => {
          results.forEach((r) => r.data.forEach((geojson) => shape.features.push(geojson)))
          resolve(shape)
        })
      )
      .catch((e) => {
        reject(e)
      })
  })
}

export const createAddressCountInfowindow = (google, event) => {
  const name = event.feature.getProperty('name')
  const count = event.feature.getProperty('count')
  const position = event.latLng
  const infowindow = new google.maps.InfoWindow({
    content: `${name} : ${count}件`,
    position,
    pixelOffset: new google.maps.Size(0, -5),
    disableAutoPan: true,
  })
  return infowindow
}

export const createMeshCountInfowindow = (google, geojsons, event) => {
  const code = event.feature.getProperty('code')
  const name = event.feature.getProperty('name')
  const count = event.feature.getProperty('count')
  const geojson = geojsons.filter((g) => g.properties.code === code)[0]
  const position = getInfowindowPosition(google, geojson)
  const infowindow = new google.maps.InfoWindow({
    content: `${name} : ${count}件`,
    position,
    disableAutoPan: true,
  })
  return infowindow
}
