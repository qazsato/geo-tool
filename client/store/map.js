import GoogleMapsApiLoader from 'google-maps-api-loader'

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
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    const google = await GoogleMapsApiLoader({
      libraries: ['visualization', 'geometry'],
      apiKey,
    })
    context.commit('load', google)
  },
}
