/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.genspark.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.genspark.ai',
        pathname: '/api/files/**',
      },
    ],
  },
  experimental: {},
}

module.exports = nextConfig
