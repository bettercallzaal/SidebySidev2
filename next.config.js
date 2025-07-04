/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Remove swcMinify as it's causing warnings
  experimental: {
    // Disabled CSS optimization due to missing critters module
    // optimizeCss: true,
    scrollRestoration: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
