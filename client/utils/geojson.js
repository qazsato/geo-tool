import _ from 'lodash'

/**
 * GeoJSON を {lat, lng} の形式の配列に変換します。
 * @param {GeoJSON} geojson
 */
export const toLocations = (geojson) => {
  let coords = []
  if (geojson.type === 'Feature') {
    if (geojson.geometry.type === 'GeometryCollection') {
      geojson.geometry.geometries.forEach((geometry) => {
        coords = coords.concat(getGeometryCoords(geometry))
      })
    } else {
      coords = getGeometryCoords(geojson.geometry)
    }
  } else if (geojson.type === 'FeatureCollection') {
    const features = geojson.features
    features.forEach((f) => {
      coords = coords.concat(getGeometryCoords(f.geometry))
    })
  }
  return coords.map((c) => {
    return { lat: c[1], lng: c[0] }
  })
}

function getGeometryCoords(geometry) {
  let coords = []
  if (geometry.type === 'Polygon') {
    coords = _.flattenDepth(geometry.coordinates, 1)
  } else if (geometry.type === 'MultiPolygon') {
    coords = _.flattenDepth(geometry.coordinates, 2)
  }
  return coords
}
