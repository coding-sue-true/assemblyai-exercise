/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ASSEMBLY_API_TOKEN: process.env.ASSEMBLY_API_TOKEN,
  },
}

module.exports = nextConfig
