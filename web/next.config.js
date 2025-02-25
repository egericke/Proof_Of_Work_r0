/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Add trailing slashes to URLs
  trailingSlash: true,
  // Customize the output directory (optional)
  distDir: 'out',
};

module.exports = nextConfig;
