/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We'll go with a full Next.js app with API routes instead of static export
  // This allows your API routes to work properly
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'], // If you're using external images
    unoptimized: process.env.NODE_ENV === 'development', // Only unoptimize in dev
  },
  // Remove the output: 'export' setting to enable API routes
};

module.exports = nextConfig;
