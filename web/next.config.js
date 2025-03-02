/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Add CSP headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:;"
          }
        ]
      }
    ];
  },
  
  // Configure webpack for Vercel compatibility
  webpack: (config) => {
    // Make sure Chart.js is handled correctly
    // This prevents issues with dynamic imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  }
};

module.exports = nextConfig;
