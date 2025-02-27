const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
});

module.exports = withPWA({
  reactStrictMode: true, // Add other Next.js config options here
});
