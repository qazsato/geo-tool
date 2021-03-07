import _ from 'lodash'
import axios from 'axios'
import japanmesh from 'japanmesh'
import GeoApi from '@/requests/geo-api'
import { calcCountGroupByCode, getInfowindowPosition } from '@/utils/mesh'

export const fetchAddressGeoJSON = async (locations, level, countRange) => {
  const LIMIT_COUNT = 10000
  if (locations.length > LIMIT_COUNT) {
    throw new Error(`住所はデータ数を${LIMIT_COUNT.toLocaleString()}件以下にしてください`)
  }
  const geojsons = []
  let data = await analayzeAddressContain(locations, level).catch((e) => {
    throw e
  })
  const minCount = Math.min(...data.map((d) => d.count))
  const maxCount = Math.max(...data.map((d) => d.count))
  if (countRange) {
    // 件数範囲がある場合は、範囲内の値だけフィルターする
    data = data.filter((d) => countRange[0] <= d.count && d.count <= countRange[1])
  } else {
    // 件数範囲がない場合は、最小、最大値を設定して返却する
    countRange = [minCount, maxCount]
  }
  const counts = data.map((d) => {
    return {
      key: d.address_name,
      count: d.count,
    }
  })
  const codes = data.map((d) => d.address_code)
  const shape = await fetchAddressShape(codes).catch((e) => {
    throw e
  })
  shape.features.forEach((feature) => {
    const d = data.filter((d) => d.address_code === feature.properties.code)[0]
    const opacity = (d.count / maxCount) * 0.9
    feature.properties.name = d.address_name
    feature.properties.count = d.count
    feature.properties.strokeWeight = 1
    feature.properties.fillOpacity = opacity
  })
  geojsons.push(shape)
  return { counts, geojsons, minCount, maxCount, countRange }
}

export const fetchMeshGeoJSON = (locations, level, countRange) => {
  const geojsons = []
  let results = calcCountGroupByCode(locations, level)
  const minCount = Math.min(...results.map((c) => c.count))
  const maxCount = Math.max(...results.map((c) => c.count))
  if (countRange) {
    // 件数範囲がある場合は、範囲内の値だけフィルターする
    results = results.filter((r) => countRange[0] <= r.count && r.count <= countRange[1])
  } else {
    // 件数範囲がない場合は、最小、最大値を設定して返却する
    countRange = [minCount, maxCount]
  }
  const counts = results.map((c, i) => {
    return { key: c.code, count: c.count }
  })
  results.forEach((c) => {
    const opacity = (c.count / maxCount) * 0.9
    const geojson = japanmesh.toGeoJSON(c.code, {
      code: c.code,
      name: c.code,
      count: c.count,
      strokeWeight: 1,
      fillOpacity: opacity,
    })
    geojsons.push(geojson)
  })
  return { counts, geojsons, minCount, maxCount, countRange }
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

function analayzeAddressContain(allLocations, level) {
  const LIMIT_PER_REQUEST = 10000 // APIの最大指定数
  const chunkLocations = _.chunk(allLocations, LIMIT_PER_REQUEST)
  return new Promise((resolve, reject) => {
    const promises = chunkLocations.map((locations) => {
      const api = new GeoApi('/analytics/addresses/contains', {
        locations,
        level,
      })
      return api.post()
    })
    axios
      .all(promises)
      .then(
        axios.spread((...results) => {
          const countByAddresses = []
          results.forEach((r) =>
            r.data.forEach((d) => {
              const hasAddress = countByAddresses.filter((a) => a.address_code === d.address_code).length > 0
              if (hasAddress) {
                countByAddresses.forEach((a) => {
                  if (a.address_code === d.address_code) {
                    a.count += d.count
                  }
                })
              } else {
                countByAddresses.push(d)
              }
            })
          )
          resolve(countByAddresses.sort((a, b) => b.count - a.count)) // 件数多い順に並び替え
        })
      )
      .catch((e) => {
        reject(e)
      })
  })
}

function fetchAddressShape(allCodes) {
  const LIMIT_PER_REQUEST = 100 // APIの最大指定数
  const shape = {
    features: [],
    type: 'FeatureCollection',
  }
  // APIの最大コード指定数を超えるとエラーとなるため分割する
  const codes = _.chunk(allCodes, LIMIT_PER_REQUEST)
  return new Promise((resolve, reject) => {
    const promises = codes.map((code) => {
      const api = new GeoApi('/addresses/shape', {
        code: code.toString(),
        limit: LIMIT_PER_REQUEST,
      })
      return api.get()
    })
    axios
      .all(promises)
      .then(
        axios.spread((...results) => {
          results.forEach((r) => r.data.features.forEach((geojson) => shape.features.push(geojson)))
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
