import _ from 'lodash'

/**
 * GeoJSON を {lat, lng} の形式の配列に変換します。
 * @param {GeoJSON} geojson
 */
export const toLocations = (geojson) => {
  let coords = []
  if (geojson.type === 'Feature') {
    if (geojson.geometry.type === 'Polygon') {
      coords = _.flattenDepth(geojson.geometry.coordinates, 1)
    } else if (geojson.geometry.type === 'MultiPolygon') {
      coords = _.flattenDepth(geojson.geometry.coordinates, 2)
    }
  } else if (geojson.type === 'FeatureCollection') {
    const features = geojson.features
    features.forEach((f) => {
      if (f.geometry.type === 'Polygon') {
        coords = coords.concat(_.flattenDepth(f.geometry.coordinates, 1))
      } else if (f.geometry.type === 'MultiPolygon') {
        coords = coords.concat(_.flattenDepth(f.geometry.coordinates, 2))
      }
    })
  }
  return coords.map((c) => {
    return { lat: c[1], lng: c[0] }
  })
}
