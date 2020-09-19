const sls = require('serverless-http')
const binaryMimeTypes = require('./binary-mime-types')
const nuxt = require('./nuxt')

module.exports.nuxt = sls(nuxt, {
  binary: binaryMimeTypes,
})
