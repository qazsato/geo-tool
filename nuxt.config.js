/* eslint-disable nuxt/no-cjs-in-config */
const Sass = require('sass')
const Fiber = require('fibers')

module.exports = {
  srcDir: 'client/',

  ssr: true,

  target: 'server',

  head: {
    titleTemplate: '%s - Geo Tool',
    htmlAttrs: { lang: 'ja' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Map Visualization Tool',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: ['element-ui/lib/theme-chalk/index.css'],

  styleResources: {
    scss: ['@/assets/styles/core.scss'],
  },

  plugins: ['@/plugins/element-ui', '@/plugins/vue-virtual-scroller'],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/style-resources',
    [
      '@nuxtjs/google-analytics',
      {
        id: 'UA-51346952-7',
      },
    ],
  ],

  modules: ['@nuxtjs/axios'],

  axios: {},

  build: {
    transpile: [/^element-ui/],
    loaders: {
      scss: {
        implementation: Sass,
        sassOptions: {
          fiber: Fiber,
        },
      },
    },
  },
}
