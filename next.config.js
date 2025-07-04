/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src')
    }

    return config
  },
}
