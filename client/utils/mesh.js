import _ from 'lodash'
import { japanmesh } from 'japanmesh'

export const calcCountGroupByCode = (locations, level) => {
  const count = {}
  locations.forEach((location) => {
    const code = japanmesh.toCode(location.lat, location.lng, level)
    if (count[code]) {
      count[code]++
    } else {
      count[code] = 1
    }
  })
  const counts = Object.entries(count).map(([code, count]) => {
    return { code, count }
  })
  return counts.sort((a, b) => b.count - a.count) // 件数多い順に並び替え
}

export const getInfowindowPosition = (google, geojson) => {
  const coords = _.flatten(geojson.geometry.coordinates)
  const northernmost = _.maxBy(coords, (c) => c[1])
  const westernmost = _.minBy(coords, (c) => c[0])
  const easternmost = _.maxBy(coords, (c) => c[0])

  return new google.maps.LatLng(northernmost[1], (westernmost[0] + easternmost[0]) / 2)
}
