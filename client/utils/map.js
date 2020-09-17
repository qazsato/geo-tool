import _ from 'lodash'

/**
 * 指定された緯度経度が全て含まれるようズーム及び中心点を調整します。
 * @param {google} google
 * @param {google.map} map
 * @param {array} locations [ {lat, lng}, ...]
 */
export const adjustViewPort = (google, map, locations) => {
  const northernmost = _.maxBy(locations, (l) => l.lat)
  const southernmost = _.minBy(locations, (l) => l.lat)
  const westernmost = _.minBy(locations, (l) => l.lng)
  const easternmost = _.maxBy(locations, (l) => l.lng)
  // 南西と北西のポイントを指定
  // https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBounds.constructor
  const shapeBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(southernmost.lat, westernmost.lng),
    new google.maps.LatLng(northernmost.lat, easternmost.lng)
  )
  map.fitBounds(shapeBounds)
}
