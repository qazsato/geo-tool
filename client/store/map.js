import GoogleMapsApiLoader from 'google-maps-api-loader'
import config from '@/config'

export const state = () => ({
  google: null,
})

export const mutations = {
  load(state, value) {
    state.google = value
  },
}

export const actions = {
  async load(context) {
    const apiKey = config.google_maps.api_key
    const google = await GoogleMapsApiLoader({ apiKey })
    context.commit('load', google)
  },
}
