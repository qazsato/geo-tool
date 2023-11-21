import { Loader } from '@googlemaps/js-api-loader'

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
    const loader = new Loader({ apiKey })
    const google = await loader.load()
    context.commit('load', google)
  },
}
