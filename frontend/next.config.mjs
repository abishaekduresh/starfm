/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost/starfm.dureshtech.com/backend/public/api',
    NEXT_PUBLIC_API_KEY: 'starfm_secure_app_key_2027',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost/starfm.dureshtech.com/backend/public/api/:path*',
      },
    ];
  },
};

export default nextConfig;
