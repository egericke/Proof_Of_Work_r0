/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Add CSP headers configuration with unsafe-eval for Chart.js
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
  
  // Configure webpack to handle Chart.js properly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure Chart.js is handled correctly
      config.resolve.alias = {
        ...config.resolve.alias,
        'chart.js/auto': 'chart.js/auto/auto.js',
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
