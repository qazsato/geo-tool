import axios from 'axios'
import config from '@/config'

export default class GeoApi {
  constructor(api, params = {}) {
    this.path = `${config.geo.api_url}${api}`
    this.headers = { Authorization: `Bearer ${process.env.GEO_API_KEY}` }
    this.params = params
  }

  /**
   * GETのPromiseを返却します。
   */
  get() {
    return axios.get(this.path, { headers: this.headers, params: this.params })
  }

  /**
   * POSTのPromiseを返却します。
   */
  post() {
    return axios.post(this.path, this.params, { headers: this.headers })
  }
}
