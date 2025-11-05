/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
        'canvas': 'commonjs canvas',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
