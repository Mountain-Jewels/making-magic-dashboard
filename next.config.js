/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [{ source: '/studio', destination: '/create', permanent: false }]
  },
}

module.exports = nextConfig

