// eslint-disable-next-line nuxt/no-cjs-in-config
module.exports = {
  srcDir: 'client/',

  mode: 'universal',

  target: 'server',

  head: {
    titleTemplate: '%s - Geo Tool',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: ['element-ui/lib/theme-chalk/index.css'],

  styleResources: {
    scss: ['@/assets/styles/core.scss'],
  },

  plugins: ['@/plugins/element-ui'],

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
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = 'inline-cheap-module-source-map'
      }
    },
  },
}
