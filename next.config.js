const withPWA = require('next-pwa')({
  dest: 'public',
})

module.exports = withPWA({
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
})