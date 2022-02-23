import axios from 'axios'
import config from '@/config'

export default class GeoApi {
  constructor(api, params = {}) {
    this.path = `${config.geo.api_url}${api}`
    this.params = { ...params, ...{ api_key: process.env.GEO_API_KEY } }
  }

  /**
   * GETのPromiseを返却します。
   */
  get() {
    return axios.get(this.path, { params: this.params })
  }

  /**
   * POSTのPromiseを返却します。
   */
  post() {
    return axios.post(this.path, this.params)
  }
}
