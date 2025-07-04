/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    // This helps with some hydration issues by prioritizing client rendering
    // for components that use browser APIs
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig
