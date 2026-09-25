/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', '10.1.1.3', '10.1.1.29', '10.1.1.51', '10.50.48.141', 'localhost'],
  images: {
    unoptimized: true,
  },
  // Ensure proper headers for development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
