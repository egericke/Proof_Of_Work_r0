/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  // Remove trailing slash setting if you don't need it
  // trailingSlash: true,
};

module.exports = nextConfig;
