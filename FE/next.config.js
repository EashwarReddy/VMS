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
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },

  async rewrites() {
    return [{ source: '/api/workspace/:path*', destination: `${process.env.WORKSPACE_API_URL || 'http://127.0.0.1:8001'}/api/workspace/:path*` }];
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
