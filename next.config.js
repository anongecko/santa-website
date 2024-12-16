/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/node-fetch\/lib\/index\.js/ },
        { module: /node_modules\/punycode\/punycode\.js/ },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
