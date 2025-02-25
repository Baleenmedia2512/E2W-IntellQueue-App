const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Add this custom worker configuration
  customWorkerSrc: 'custom-sw', // without .js extension
  customWorkerDest: 'public'
})

module.exports = withPWA({
  experimental: {
    nextScriptWorkers: true,
  },
})