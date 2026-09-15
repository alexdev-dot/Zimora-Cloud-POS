/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', '10.1.1.3'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
