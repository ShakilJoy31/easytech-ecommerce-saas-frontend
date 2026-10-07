// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This allows ALL HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // This allows ALL HTTP domains
      },
    ],
  },
  staticPageGenerationTimeout: 300
}

module.exports = nextConfig