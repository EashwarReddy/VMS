/** @type {import('next').NextConfig} */

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  experimental: {
    esmExternals: true,
    allowedDevOrigins: ['http://10.244.3.201:3000', 'http://localhost:3000'],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },

  async redirects() {
    return [
      { source: "/package.json", destination: "/404", permanent: false },
      { source: "/package-lock.json", destination: "/404", permanent: false },
      { source: "/yarn.lock", destination: "/404", permanent: false },
      { source: '/:path*.json', destination: '/404', permanent: false },
    ];
  },
};

module.exports = nextConfig;
